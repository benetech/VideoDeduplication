#!/usr/bin/env bash
# This module provides a 'confirm' function which allows
# users to confirm or reject the statement. You should
# source this module to make it available in your script.

# Ask user for confirmation and save result to the variable.
# Args:
#   $1 (variable reference): Variable name to save result to (YES or NO).
#   $2 (string): Question to ask.
#   $3 (optional YES|NO): Default answer (used on empty user input).
function confirm() {
  # Use function name as a var-name prefix
  # to prevent circular name reference
  # See https://stackoverflow.com/a/33777659
  # See http://mywiki.wooledge.org/BashFAQ/048#line-120
  local -n _confirm_result=$1;
  local confirm_text=$2;
  local default=${3:-YES}
  local answer;

  local answer_pattern;
  if [ "$default" = "YES" ]; then
    answer_pattern="[Y/n]";
  else
    answer_pattern="[y/N]";
  fi

  while true; do
    tput setaf 6; echo -n "$confirm_text $answer_pattern: "; tput sgr0;
    read -r answer;
    # shellcheck disable=SC2015
    # Disable false-positive on condition expression.
    if [ -z "$answer" ] && [ "$default" = "YES" ] || [[ "$answer" =~ [Yy] ]]; then
      # shellcheck disable=SC2034
      # Variable is passed by reference
      _confirm_result=YES;
      return 0;
    elif [ -z "$answer" ] && [ "$default" = "NO" ] || [[ "$answer" =~ [Nn] ]]; then
      # shellcheck disable=SC2034
      # Variable is passed by reference
      _confirm_result=NO;
      return 0;
    else
      tput setaf 1; echo -n "ERROR"; tput sgr0; echo ": Cannot recognize the answer '$answer'. Please answer 'y' or 'n'"
    fi
  done
}
