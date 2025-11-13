# CS-2450--Group-Project


## Description
This README will give a detailed steps to set up a UVUAdvisorBot from the command line


## Prerequisites
Python 3.8 or higher installed

## Installation

To set up the UVUAdvisorBot from the command line, it is important to first download privateGPT github file repository(https://github.com/imartinez/privateGPT). After that, clone the web URL and go to the command line. Make sure python is downloaded onto your device and then input this command into the comand line: git clone https://github.com/imartinez/privateGPT && cd privateGPT && \
python3.11 -m venv .venv && source .venv/bin/activate && \
pip install --upgrade pip poetry && poetry install --with ui,local && ./scripts/setup
Doing all that will create a file named privateGPT on your device and will install poetry to be able to run it. Now go to command line, change directory to the privateGPT file and run this command: poetry run python3.11 -m private_gpt
It will then create the server and then you can either open a new terminal and enter: open http://127.0.0.1:8001/ or you can copy and paste and address it gives you into a brower and it will open.
To set up the UVUAdvisorBot from the command line, it is important to first download privateGPT github file repository(https://github.com/imartinez/privateGPT). After that, clone the web URL and go to the command line. Make sure python is downloaded onto your device and then input this command into the comand line: 
    git clone https://github.com/imartinez/privateGPT && cd privateGPT && \
    python3.11 -m venv .venv && source .venv/bin/activate && \
    pip install --upgrade pip poetry && poetry install --with ui,local && ./scripts/setup
Doing all that will create a file named privateGPT on your device and will install poetry to be able to run it. Now go to command line, change directory to the privateGPT file and run this command: 
    poetry run python3.11 -m private_gpt
It will then create the server and then you can either open a new terminal and enter: open http://127.0.0.1:8001/ or you can copy and paste and address it gives you into a brower and it will open. 



## GUI

For the gui we used tkinter which is an already installed python library so no extra download is required. 
