#!/usr/bin/env bash
# This module provides a 'choose' function which allows
# users to choose from a set of options using arrow keys.
# You should source this module to make it available in
# your script.
# Based on: https://www.bughunter2k.de/blog/cursor-controlled-selectmenu-in-bash


# Get choice value.
# Args:
#   $1: Choice in the form of value="Display text."
function choose.option-value() {
  local entry=$1;
  echo "$entry" | grep -Po "^[^=]+"
}

# Get choice display text.
# Args:
#   $1: Choice in the form of value="Display text."
function choose.option-text() {
  local entry=$1;
  echo "$entry" | grep -Po "(?<==).*$"
}

# Print choices.
# Args:
#   $1 (number): Index of currently selected choice.
#   *: Any number of choices in the form of value="Display text".
function choose.print-options() {
  local cur=$1; shift 1;
  local entries=( "$@" )
  for entry in "${entries[@]}"; do
    if [[ ${entries[$cur]} == "$entry" ]]; then
      # Print green. See http://linuxcommand.org/lc3_adv_tput.php, "Text Effects"
      tput setaf 2; echo ">$(choose.option-text "$entry")"; tput sgr0;
    else
      echo " $(choose.option-text "$entry")";
    fi
  done
}

# Erase printed choices.
# Args:
#   $1 (number): Number of choices.
function choose.erase-options() {
  local count=$1;
  for _ in $(seq "$count"); do
    # Move cursor one line up
    # See http://linuxcommand.org/lc3_adv_tput.php, "Controlling The Cursor"
    tput cuu1;
  done
  # Clear from the cursor to the end of the screen
  # See http://linuxcommand.org/lc3_adv_tput.php, "Clearing The Screen"
  tput ed;
}

# Ask user to select from the list of options using arrow keys.
# Args:
#  $1 (variable reference): Variable to write result to.
#  *: Any number of choices in the form value="Display text"
# Example:
#   local MODE;
#   choose MODE prod="Use production mode" dev="Use development mode"
function choose() {
  # Use function name as a var-name prefix
  # to prevent circular name reference
  # See https://stackoverflow.com/a/33777659
  # See http://mywiki.wooledge.org/BashFAQ/048#line-120
  local -n _choose_result=$1; shift 1
  local entries=( "$@" )
  local cur=0;

  choose.print-options "$cur" "${entries[@]}"

  while read -sN1 key; do
    # Catch multi-char special key sequences
    # See https://stackoverflow.com/a/11759139
    read -sN1 -t 0.0001 k1
    read -sN1 -t 0.0001 k2
    read -sN1 -t 0.0001 k3
    key+=${k1}${k2}${k3}

    case "$key" in
      # Enter or Space was pressed
      ''|$'\x20'|$'\x0A')
        # shellcheck disable=SC2034
        # Variable is passed by reference
        _choose_result="$(choose.option-value "${entries[$cur]}")";
        return 0;;

      # Arrow up or left: previous item:
      $'\e[A'|$'\e0A'|$'\e[D'|$'\e0D')
        ((cur > 0)) && ((cur--));;

      # Arrow down or right: next item:
      $'\e[B'|$'\e0B'|$'\e[C'|$'\e0C')
        ((cur < ${#entries[@]}-1)) && ((cur++));;

      # Home: first item
      $'\e[1~'|$'\e0H'|$'\e[H')
        cur=0;;

      # End: last item
      $'\e[4~'|$'\e0F'|$'\e[F')
        ((cur=${#entries[@]}-1));;

      # 'q' or carriage return: Quit
      q|$'\e')
        return 1;;
    esac

    choose.erase-options "${#entries[@]}"
    choose.print-options "$cur" "${entries[@]}"
  done
}