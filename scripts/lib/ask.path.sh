#!/usr/bin/env bash
# This module provides a 'read-file-path' and 'read-dir-path' functions
# to ask users for existing file and directory path correspondingly.
# You should source this module to make it available in your script.

# Ask user to provide an existing directory path.
# Args:
#   $1 (variable reference): Variable to write result to.
#   $2 (string): Question to ask.
function read-dir-path() {
  # Use function name as a var-name prefix
  # to prevent circular name reference
  # See https://stackoverflow.com/a/33777659
  # See http://mywiki.wooledge.org/BashFAQ/048#line-120
  local -n _read_dir_path_result=$1;
  local question=$2;
  local answer;

  while true; do
    tput setaf 6; echo -n "$question: "; tput sgr0;
    read -e -r answer;
    if [ -d "$answer" ]; then
      # shellcheck disable=SC2034
      # Variable is passed by reference
      _read_dir_path_result=$answer;
      return 0;
    else
      tput setaf 1; echo -n "ERROR"; tput sgr0; echo ": No such directory: '$answer'"
    fi
  done
}

# Ask user to provide an existing file path.
# Args:
#   $1 (variable reference): Variable to write result to.
#   $2 (string): Question to ask.
function read-file-path() {
  # Use function name as a var-name prefix
  # to prevent circular name reference
  # See https://stackoverflow.com/a/33777659
  # See http://mywiki.wooledge.org/BashFAQ/048#line-120
  local -n _read_file_path_result=$1;
  local question=$2;
  local answer;

  while true; do
    tput setaf 6; echo -n "$question: "; tput sgr0;
    read -e -r answer;
    if [ -f "$answer" ]; then
      # shellcheck disable=SC2034
      # Variable is passed by reference
      _read_file_path_result=$answer;
      return 0;
    else
      tput setaf 1; echo -n "ERROR"; tput sgr0; echo ": No such file: '$answer'"
    fi
  done
}
