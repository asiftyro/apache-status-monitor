# Apache Status Monitor

### Setup Instruction:

Install Node:

    curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
    
    sudo yum install -y nodejs


Install Git: 
   
    sudo yum install git


Install PM2:

    npm install pm2 -g 

Install App:

    mkdir /var/opt/apache-status-monitor
    
    cd /opt
    
    git clone https://github.com/asiftyro/apache-status-monitor.git

    npm i
    
    vi client.html  [Edit line 38 var serverURL = 'http://localhost:3000' to match host.]

Start App:

    cd /opt/apache-status-monitor
    
    npm start

Stop App:

    cd /opt/apache-status-monitor
    
    npm stop

Configure App:
    
    Edit /opt/apache-status-monitor/server-list.json to set servers to be monitored.

    Edit /opt/apache-status-monitor/config.json to set App related pref.


PM2 Commands:

    pm2 delete all

    pm2 stop --watch 0

    pm2 stop 0

    pm2 start app.js --watch --name apache-status-monitor -e err.log -o out.log

    pm2 monit
