const socket = io();

// elements

const $messageForm=document.querySelector("#message")
const $messageInput=$messageForm.querySelector("input")
const $messageButton=$messageForm.querySelector("button")
const $sendLocationButton=document.querySelector("#send-location")
const $messages=document.querySelector("#messages")
const $sidebar=document.querySelector("#sidebar")

// templates
const messageTemplate=document.querySelector("#message-template").innerHTML
const locationTemplate=document.querySelector("#location-template").innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML
// options
const {username,room} =Qs.parse(location.search,{ignoreQueryPrefix:true})


// autoScroll
const autoScroll=()=>{
  // new message element
  const $newMessage=$messages.lastElementChild;
// height of the new message
const newMessageStyles=getComputedStyle($newMessage)
const newMessageMargin=parseInt(newMessageStyles.marginBottom)
const newMessageHeight=$newMessage.offsetHeight+newMessageMargin

// visible height
const visibleHeight=$messages.offsetHeight

// Height of messages container
const containerHeight=$messages.scrollHeight

// how far i have scrolled
const scrollOffset=$messages.scrollTop+visibleHeight 
if(containerHeight-newMessageHeight<=scrollOffset){
  $messages.scrollTop=$messages.scrollHeight
}
}



socket.on("message", message => {
  console.log(message);
  const html=Mustache.render(messageTemplate,{
    username:message.username,
    message:message.text,
    createdAt:moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  autoScroll()
});

socket.on("locationMessage",(url)=>{
  console.log(url)
  const html=Mustache.render(locationTemplate,{
    username:url.username,
    url:url.url,
    createdAt:moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend',html)
  autoScroll()
})

socket.on("roomData",({room,users})=>{
const html=Mustache.render(sidebarTemplate,{
  room,
  users
})
$sidebar.innerHTML=html;
console.log(room,users)
})


$messageForm.addEventListener("submit", e => {
  e.preventDefault();
  $messageButton.setAttribute("disabled","disabled")
 const message=e.target.elements.message.value
  socket.emit("sendMessage", message,(error)=>{
      $messageButton.removeAttribute("disabled")
      $messageInput.value=''
      $messageInput.focus()
      if(error){
         return  console.log(error)
      }
    console.log("Message delivered!")
  });
 
});




$sendLocationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by your browser");
  }
  $sendLocationButton.setAttribute("disabled","disabled")
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    },()=>{
        $sendLocationButton.removeAttribute("disabled")
        console.log("Location shared")
    });
  });
});

socket.emit('join',{username,room},(error)=>{
  if(error){
    alert(error)
    location.href="/"
  }
  
})


// ------------------------count code-----------------------------------
// socket.on("countUpdated",(count)=>{
//     console.log("The count has been updated!",count)
// })

// document.querySelector("#increment").addEventListener("click",()=>{
//     console.log("Clicked")
//     socket.emit("increment")
// })
