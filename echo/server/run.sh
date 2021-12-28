#!/bin/sh
# Start the Cartesi HTTP-Dispatcher and the echo-dapp.
# This script must run inside the cartesi machine

HTTP_DISPATCHER_PORT=5001
DAPP_PORT=5002

# Enable python env
export PATH=/mnt/echo-dapp/bin:$PATH
export LD_LIBRARY_PATH=/mnt/echo-dapp/lib:$LD_LIBRARY_PATH

# Change dir to echo-dapp root
cd /mnt/echo-dapp/echo-dapp

# Start echo dapp
python3 echo.py 127.0.0.1 $DAPP_PORT http://127.0.0.1:$HTTP_DISPATCHER_PORT &

# Wait for the echo dapp to start up
RETRY=0
while ! netstat -ntl 2&>1 | grep 5002 > /dev/null
do
    echo "waiting for dapp ($RETRY)"
    sleep 1
    RETRY=$(echo $RETRY + 1 | bc)
    if [ "$RETRY" == "100" ]
    then
        echo "echo dapp timed out"
        return 1
    fi
done

# Start http dispatcher
http-dispatcher --address 127.0.0.1:$HTTP_DISPATCHER_PORT --dapp 127.0.0.1:$DAPP_PORT --verbose
