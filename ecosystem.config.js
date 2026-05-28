module.exports = {
  apps: [
    {
      name: 'commerce-backend',
      script: 'C:/Program Files/Python312/python.exe',
      args: '-m uvicorn main:app --host 0.0.0.0 --port 8004',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      cwd: 'C:/projeck/commerce/backend',
    },
    {
      name: 'commerce-admin',
      script: 'node_modules\\next\\dist\\bin\\next',
      args: 'start -p 3000',
      cwd: 'C:/projeck/commerce/frontend/admin',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    },
    {
      name: 'commerce-website',
      script: 'node_modules\\next\\dist\\bin\\next',
      args: 'start -p 3001',
      cwd: 'C:/projeck/commerce/frontend/website',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
    }
  ]
};