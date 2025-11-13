import streamlit as st
import pandas as pd

class ColorScheme:
    def __init__(self):
        self.bg_color = "#dee2e6"
        self.bg_offset = "#ced4da"
        self.primary = "#275d38"
        self.secondary = "#416f4f"
        self.white = "#ffffff"
        self.black = "#000000"
        self.title = "#275d38"
        self.font1 = "#000000"
        self.font2 = "#ffffff"
    
    def set_color_scheme_custom(self, primary : str, secondary : str):
        self.primary = primary
        self.secondary = secondary

    def set_color_scheme_dark(self):
        self.bg_color = "#275d38"
        self.bg_offset = "#416f4f"
        self.primary = self.white
        self.secondary = "#ced4da"
        self.font1 = self.white
        self.font2 = self.black

    def reset_to_default(self):
        self.bg_color = "#dee2e6"
        self.bg_offset = "#ced4da"
        self.primary = "#275d38"
        self.secondary = "#416f4f"

def chat_bubble(sender, message, color):
    '''
    Creates message bubbles for chat
    '''

    st.markdown(f'<div style="background-color: {color}; padding: 10px; border-radius: 10px; margin: 5px;">'
                f'<p style="margin: 0;">{sender}</p>'
                f'<p style="margin: 0;">{message}</p>'
                f'</div>', unsafe_allow_html=True)



def send(user, message, color):
    '''
    
    '''
    chat_bubble(user, message, color)



def main():
    # Header
    st.title("UVUAdvisor Bot")


    settingButton,colorSelector, roleSelect, myProfileButton = st.columns(4)
    with settingButton:
        if st.button("Setting"):
            setting_df = pd.DataFrame( #Creates the data frame
            {
                "Options": [
                "Change Color",
                "Create new account",],
            })
            st.data_editor(
                setting_df,
                # Configurates the colum into a select box column
                column_config={
                    "options": st.column_config.SelectboxColumn
                        ("Setting category",help="The options for setting",width="small",
                #The different option choices we have
                        options=[
                        "Change Colors",
                        "Create New account",
                        ],
                        required=True,
                    )
                }
            )    
            if st.button("Setting"):
                hide_index=True
                pass
             
    with colorSelector:
        if st.button("What-If"):
            on = st.toggle('Dark Mode')
            lightMode = st.toggle("LightMode")
            if on:
                st.write('Feature activated!')
            if lightMode:
                st.write('Feature activited!')
            # Handle What-If button click
            pass
    with roleSelect:
        if st.button("RoleSelector"):
            expand = st.expander("Role Select")
            expand.write("Please Select on of the roles")
            pop = st.popover("Click to Select Role")
            pop.checkbox("Show all")
            with expand:
                roleSelect = st.radio("Select one:", ["Administrator", "User", "Advisor"])
            # Handle Search button click
    with myProfileButton:
        if st.button("My Profile"):
            # Handle My Profile button click
            pass

    # Chat Area
    st.subheader("Chat with UVUAdvisor Bot")

    chat_history = [
        {"sender": "UVUAdvisor Bot", "message": "Hello! How can I assist you today?", "color": "green"},
    ]
    for chat in chat_history:
        chat_bubble(chat["sender"], chat["message"], chat["color"])


    # Input Bar
    user_input = st.text_input("Type your message here:", "")


    if st.button("Send"):
        '''
        Handles the send button 

        adds message to chat history and clears user_input
        
        '''
        chat_history.append({"sender": "User", "message": user_input, "color": "grey"})
        send("User", user_input, "grey")
        user_input = " "
        

if __name__ == "__main__":
    main()
