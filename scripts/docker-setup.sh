#!/usr/bin/env bash

read -r -d '' HELP << ENDOFHELP
usage: ./docker-setup.sh [--help] [-f | --force-update]

Generate .env file used by docker-compose tool
and some docker-related scripts under the ./script
directory.

See also https://docs.docker.com/compose/env-file/
ENDOFHELP

FORCE_UPDATE=NO;

# Read arguments
while (( $# > 0 )); do
  case $1 in
    -f|--force-update)
      FORCE_UPDATE=YES;
      shift;
      ;;
    --help)
      echo "$HELP";
      exit 0;
      ;;
    *)
      echo "Unrecognized argument: $1";
      echo "$HELP"
      exit 1;
  esac
done


LIBS="$(realpath "$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )/lib" )"
source "$LIBS/ask.choose.sh"
source "$LIBS/ask.confirm.sh"
source "$LIBS/ask.path.sh"

if [ -f ".env" ]; then
  source .env
fi

# Read source data location
if [ "$FORCE_UPDATE" = "YES" ] || ! [ -d "$BENETECH_DATA_LOCATION" ]; then
  DIRTY=yes
  tput setaf 6; echo "Please specify the root folder with your video files (use Tab for auto-complete)."; tput sgr0;
  read-dir-path BENETECH_DATA_LOCATION "Data folder path"
  echo
fi

# Choose data analysis runtime
if [ "$FORCE_UPDATE" = "YES" ] || [ -z "$BENETECH_RUNTIME" ]; then
  DIRTY=yes
  tput setaf 6; echo "Would you like to use GPU for data processing?"; tput sgr0;
  choose BENETECH_RUNTIME gpu="Use GPU for data processing." cpu="Use CPU for data processing."
  if [ "$BENETECH_RUNTIME" = "gpu" ]; then
    BENETECH_DOCKER_RUNTIME="nvidia"
  else
    BENETECH_DOCKER_RUNTIME="runc"
  fi
  echo
fi


# Decide whether to use prebuilt images
if [ "$FORCE_UPDATE" = "YES" ] || [ -z "${BENETECH_MODE+x}" ]; then
  DIRTY=yes
  tput setaf 6; echo "Would you like to use production Docker images?"; tput sgr0;
  choose BENETECH_MODE ''="Use production images." '-dev'="Pull the latest dev-images or build images locally."
  echo
fi

# Write data to the .env file
if [ -n "$DIRTY" ]; then
  {
    echo "# This file is generated by scripts/docker-setup.sh"
    echo "BENETECH_DATA_LOCATION=$BENETECH_DATA_LOCATION"
    echo "BENETECH_RUNTIME=$BENETECH_RUNTIME"
    echo "BENETECH_DOCKER_RUNTIME=$BENETECH_DOCKER_RUNTIME"
    echo "BENETECH_MODE=$BENETECH_MODE"
  } > .env
  tput setaf 2; echo -n "OK"; tput sgr0;
  echo " Configuration is written to the $(pwd)/.env";
fi
