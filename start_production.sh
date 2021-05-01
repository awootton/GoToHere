#!/bin/bash



# run this is a terminal window
# it will build the project, copy it, and run it as prod

yarn build

mkdir -p ../eBanterProdCopyAtw 

rsync -a . ../eBanterProdCopyAtw 

cd ../eBanterProdCopyAtw 

yarn server