import { useState } from "react"
import  ReactMarkdown from 'react-markdown'
import Head from 'next/head'
//import TextareaAutoSize from "react-textarea-autosize"
//import { createParser } from "eventsource-parser";
import Navbar from '@/components/navbar';
import { useUser } from "@supabase/auth-helpers-react";
import { streamOpenAIResponse } from "@/utils/openai";


const SYSTEM_MESSAGE ="You are a Buddy Bot, a helpful and versatile AI \
                       created by Krishna using state-of-art ML models and api's."


export default function Home() {

  // create state variable
  const user = useUser();

  const [userMessage, setUserMessage] = useState("");
  const [messages, setMessages] = useState([
    {role:"system", content: SYSTEM_MESSAGE}
  ]);

  const API_URL = "/api/chat";

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey){
      e.preventDefault();
      sendRequest();
    }
  };

  const sendRequest = async () => {


    if (!user) {
      alert("Please login to send a message")
      return;
    }


      if (!userMessage) {
        alert("Please enter a message before you hit send");
        return;
      }

      const oldUserMessage = userMessage;
      const oldMessages = messages;

      const updatedMessages = [
        ...messages,
        {
          role: "user",
          content: userMessage,
        },
      ];

      setMessages(updatedMessages);
      setUserMessage("");

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: updatedMessages,
            stream: true,
          }),
        });

        if (response.status !== 200) {
          throw new Error(
            `OpenAI API returned an error. Please ensure you've provided the right API key. Check the "Console" or "Network" of your browser's developer tools for details.`
          );
        }

        streamOpenAIResponse(response, (newMessage) => {
          const updatedMessages2 = [
            ...updatedMessages,
            { role: "assistant", content: newMessage },
          ];

          setMessages(updatedMessages2);
        });
      } catch (error) {
        console.error("error", error);

        setUserMessage(oldUserMessage);
        setMessages(oldMessages);
        window.alert("Error:" + error.message);
      }
  };
  return (
  <><Head>
  <title>Buddy - Your friendly neighborhood AI</title></Head>
  <div className="flex flex-col h-screen">
  {/* Navigation Bar */}
  <Navbar/>
  {/* Message History */}
  <div className="flex-1 overflow-y-scroll">
    <div className="w-full max-w-screen-md mx-auto px-4">
      {messages.filter(message => message.role !== "system").map((message, idx) => (
        <div key={idx} className="my-3">
          <div className="font-bold">
            {message.role === "user" ? "You":"Buddy"}
          </div>
          <div className="text-lg prose">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        </div>
      ))}
    </div>
  </div>
  {/* Message Input Box */}
  <div>
    <div className="w-full max-w-screen-md mx-auto flex px-4 pb-4">
      <textarea 
      className="border text-lg rounded-md p-1 flex-1" 
      value = {userMessage}
      onChange ={e => setUserMessage(e.target.value)}
      rows={1}/>
      <button 
        className="border text-lg rounded-md p-1 w-20 ml-2 bg-blue-500 hover:bg-blue-600 text-white"
        onKeyDown = {handleKeyDown}
        onClick={sendRequest}>
        Send
      </button>
    </div>
  </div>
</div>
</>
  );
}
