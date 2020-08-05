#!/usr/bin/env bash

if [ -f ".env" ]; then
  source .env
fi

# Read source data locaion
while ! [ -d "$BENETECH_DATA_LOCATION" ]; do
  DIRTY=yes
  echo -n -e "\e[36mPlease specify the root folder with your video files (use Tab for auto-complete): \e[0m"
  read -e -r BENETECH_DATA_LOCATION
  if ! [ -d "$BENETECH_DATA_LOCATION" ]; then
    echo -e "\e[31mERROR\e[0m No such directory: $BENETECH_DATA_LOCATION"
  fi
done

# Choose data analysis runtime
while [ -z "$BENETECH_RUNTIME" ]; do
  DIRTY=yes
  echo -n -e "\e[36mWould you like to use GPU for data analysis? [Y/n]: \e[0m"
  read -r RUNTIME_ANSWER
  if [ -z "$RUNTIME_ANSWER" ] || [[ "$RUNTIME_ANSWER" =~ [Yy] ]]; then
    export BENETECH_RUNTIME=GPU
  elif [[ "$RUNTIME_ANSWER" =~ [Nn] ]]; then
    export BENETECH_RUNTIME=CPU
  else
    echo -e "\e[31mERROR\e[0m Cannot recognize answer. Please answer 'y' or 'n'"
  fi
done

# Write data to the .env file
if [ -n "$DIRTY" ]; then
  {
    echo "BENETECH_DATA_LOCATION=$BENETECH_DATA_LOCATION"
    echo "BENETECH_RUNTIME=$BENETECH_RUNTIME"
  } > .env

  echo -e "\e[1mOK\e[0m Configuration is written to the $(pwd)/.env file"
fi