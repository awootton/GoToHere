#!/bin/bash



# run this is a terminal window
# it will build the project, copy it docs/_sites2
# in the knot free project

yarn build

#  mkdir -p ../eBanterProdCopyAtw 

rsync -a ./build/ ../knotfreeiot/docs/_site2/ 
