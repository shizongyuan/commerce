/**
 * 通用智能网页数据采集脚本
 * 基于 multi-agent-universal-scraper 多Agent协作框架
 *
 * 使用方式:
 *   node scraper.js --url <url> --username <user> --password <pass> --taskid <id> --output <dir>
 */

const { chromium } = require('playwright');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 命令行参数解析
const args = process.argv.slice(2);
const getArg = (name, defaultVal = '') => {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 ? args[idx + 1] || defaultVal : defaultVal;
};

const TARGET_URL = getArg('url');
const USERNAME = getArg('username');
const PASSWORD = getArg('password');
const TASK_ID = getArg('taskid', 'task');
const OUTPUT_DIR = getArg('output', './data');
const DESCRIPTION = getArg('description', '网页数据');

if (!TARGET_URL) {
  console.error(JSON.stringify({ error: 'URL is required', file: null }));
  process.exit(1);
}

// 确保输出目录存在
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * 通用智能选择器检测
 */
async function detectSelectors(page) {
  const analysis = await page.evaluate(() => {
    const result = {
      tables: [],
      lists: [],
      forms: [],
      loginForm: null
    };

    // 检测表格
    document.querySelectorAll('table').forEach((table, i) => {
      const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent.trim());
      const rows = table.querySelectorAll('tr').length;
      if (rows > 0) {
        result.tables.push({
          selector: `table:nth-of-type(${i + 1})`,
          headers,
          rowCount: rows
        });
      }
    });

    // 检测列表
    document.querySelectorAll('ul, ol').forEach((list, i) => {
      const items = list.querySelectorAll('li').length;
      if (items > 2) {
        result.lists.push({
          selector: `${list.tagName.toLowerCase()}:nth-of-type(${i + 1})`,
          itemCount: items
        });
      }
    });

    // 检测登录表单
    const forms = document.querySelectorAll('form');
    forms.forEach((form, i) => {
      const inputs = form.querySelectorAll('input[type="text"], input[type="email"]');
      const passwords = form.querySelectorAll('input[type="password"]');
      if (inputs.length > 0 && passwords.length > 0) {
        result.loginForm = {
          selector: `form:nth-of-type(${i + 1})`,
          hasUsername: inputs.length > 0,
          hasPassword: passwords.length > 0
        };
      }
    });

    return result;
  });

  return analysis;
}

/**
 * 自动检测输入框和按钮选择器
 */
async function detectLoginElements(page) {
  const elements = await page.evaluate(() => {
    const result = {
      usernameSelector: null,
      passwordSelector: null,
      loginButton: null
    };

    // 用户名输入框
    const usernameInputs = document.querySelectorAll('input[type="text"], input[type="email"], input[name*="user"], input[name*="name"], input[id*="user"], input[id*="name"], input[placeholder*="user"], input[placeholder*="name"], input[placeholder*="账号"]');
    if (usernameInputs.length > 0) {
      result.usernameSelector = usernameInputs[0].tagName + '[placeholder*="' + usernameInputs[0].getAttribute('placeholder') + '"]';
    }

    // 密码输入框
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    if (passwordInputs.length > 0) {
      result.passwordSelector = 'input[type="password"]';
    }

    // 登录按钮
    const loginButtons = document.querySelectorAll('button[type="submit"], button:not([type]), input[type="submit"], a[class*="login"], button[class*="login"]');
    if (loginButtons.length > 0) {
      result.loginButton = loginButtons[0].tagName + (loginButtons[0].className ? '.' + loginButtons[0].className.split(' ')[0] : '');
    }

    return result;
  });

  return elements;
}

/**
 * 提取表格数据
 */
async function extractTableData(page, selector) {
  const data = await page.evaluate((sel) => {
    const table = document.querySelector(sel);
    if (!table) return { headers: [], rows: [] };

    const headers = Array.from(table.querySelectorAll('th')).map(h => h.textContent.trim());
    const rows = Array.from(table.querySelectorAll('tbody tr, tr')).map(tr => {
      return Array.from(tr.querySelectorAll('td')).map(td => td.textContent.trim());
    });

    return { headers, rows };
  }, selector);

  return data;
}

/**
 * 提取列表数据
 */
async function extractListData(page, selector) {
  const data = await page.evaluate((sel) => {
    const list = document.querySelector(sel);
    if (!list) return { items: [] };

    const items = Array.from(list.querySelectorAll('li')).map(li => li.textContent.trim());
    return { items };
  }, selector);

  return data;
}

/**
 * 通用数据采集 - 智能分析页面结构
 */
async function smartScrape(page, url) {
  console.log('开始智能分析页面结构...');

  // 1. 页面分析 (研究员 Agent)
  const analysis = await detectSelectors(page);
  console.log(JSON.stringify({ phase: 'researcher', analysis: analysis }));

  // 2. 数据提取 (开发者 Agent)
  let extractedData = {
    tables: [],
    lists: [],
    rawHtml: await page.content()
  };

  // 提取表格数据
  for (const table of analysis.tables) {
    const data = await extractTableData(page, table.selector);
    if (data.rows.length > 0) {
      extractedData.tables.push({
        selector: table.selector,
        headers: data.headers.length > 0 ? data.headers : data.rows[0],
        rows: data.rows
      });
    }
  }

  // 提取列表数据
  for (const list of analysis.lists) {
    const data = await extractListData(page, list.selector);
    if (data.items.length > 0) {
      extractedData.lists.push({
        selector: list.selector,
        items: data.items
      });
    }
  }

  // 3. 测试验证 (测试员 Agent)
  const totalRecords = extractedData.tables.reduce((sum, t) => sum + t.rows.length, 0);
  console.log(JSON.stringify({ phase: 'tester', recordCount: totalRecords }));

  return extractedData;
}

/**
 * 导出数据到 Excel 和 JSON
 */
function exportData(data, taskId) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const baseName = `scrape_${taskId}_${timestamp}`;

  // 导出 JSON
  const jsonFile = path.join(OUTPUT_DIR, `${baseName}.json`);
  fs.writeFileSync(jsonFile, JSON.stringify(data, null, 2), 'utf-8');

  // 导出 Excel
  let wb;
  try {
    wb = xlsx.Workbook ? new xlsx.WorkBook() : null;
  } catch (e) {
    wb = null;
  }

  if (wb) {
    // 表格数据导出
    if (data.tables && data.tables.length > 0) {
      const ws = xlsx.utils.json_to_sheet([]);
      data.tables.forEach((table, ti) => {
        if (table.rows && table.rows.length > 0) {
          table.rows.forEach((row, ri) => {
            const colIndex = ti * (table.headers?.length || row.length);
            row.forEach((cell, ci) => {
              const cellAddr = xlsx.utils.encode_cell({ r: ri, c: ci + colIndex });
              ws[cellAddr] = { t: 's', v: cell };
            });
          });
        }
      });
      xlsx.utils.book_append_sheet(wb, ws, 'Data');
    }

    const xlsxFile = path.join(OUTPUT_DIR, `${baseName}.xlsx`);
    try {
      xlsx.writeFile(wb, xlsxFile);
    } catch (e) {
      console.log('Excel export skipped (xlsx write failed)');
    }
  }

  const totalRecords = data.tables?.reduce((sum, t) => sum + t.rows.length, 0) || 0;
  return { file: jsonFile, recordCount: totalRecords };
}

/**
 * 主采集流程
 */
async function main() {
  console.log(JSON.stringify({ phase: 'start', url: TARGET_URL }));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  try {
    // Step 1: 访问目标URL
    console.log(JSON.stringify({ phase: 'navigating', url: TARGET_URL }));
    await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 60000 });

    // Step 2: 检查是否需要登录
    const loginElements = await detectLoginElements(page);

    if (loginElements.usernameSelector || loginElements.passwordSelector) {
      console.log(JSON.stringify({ phase: 'login_required' }));

      // 自动填充登录表单
      if (USERNAME && loginElements.usernameSelector) {
        await page.fill(loginElements.usernameSelector, USERNAME);
      }
      if (PASSWORD && loginElements.passwordSelector) {
        await page.fill(loginElements.passwordSelector, PASSWORD);
      }

      // 点击登录按钮
      if (loginElements.loginButton) {
        await page.click(loginElements.loginButton);
        await page.waitForTimeout(3000);
      }
    }

    // Step 3: 执行智能采集
    const data = await smartScrape(page, TARGET_URL);

    // Step 4: 评审员确认 & 导出
    const result = exportData(data, TASK_ID);

    console.log(JSON.stringify({
      phase: 'complete',
      file: result.file,
      recordCount: result.recordCount
    }));

  } catch (error) {
    console.error(JSON.stringify({
      phase: 'error',
      message: error.message
    }));
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// 运行
main().catch(err => {
  console.error(JSON.stringify({ error: err.message }));
  process.exit(1);
});