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
  ]
};