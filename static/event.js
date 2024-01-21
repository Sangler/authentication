const checkbox = document.querySelector("#checkbox")
checkbox.addEventListener('change', () => {
const isDarkMode = checkbox.checked;
    // Add or remove the 'dark-theme' class based on the checkbox state
    document.documentElement.classList.toggle("dark-theme", isDarkMode);
});
    const next_btn = document.querySelector("#valid");
    const useremail = document.querySelector("#username");
    const sendOTP = document.querySelector("#otp");

    sendOTP.addEventListener("click",async (e)=>{
        e.preventDefault();
        // console.log(useremail.value); value in input
        // Generate a random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000);
        // Send useremail.value & otp to server as JSON{}
        //console.log(otp) 
        try {
            if (response.ok) {
                // Request was successful
                console.log('OTP sent successfully!');
                // Handle further actions after OTP is sent
            } else {
                console.error('Failed to send OTP');
                // Handle error cases
            }
        } catch (error) {
            console.error('Error sending OTP:', error);
        }

    });

    next_btn.addEventListener('click',async (evt)=>{
        evt.preventDefault();
        const userOTP ={
            otp1: document.getElementById('ist').value,
            otp2: document.getElementById('sec').value,
            otp3: document.getElementById('third').value,
            otp4: document.getElementById('fourth').value,
            otp5: document.getElementById('fifth').value,
            otp6: document.getElementById('sixth').value
        }
        console.log(userOTP);
        console.log(typeof(userOTP));

        /*
        try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userOTP: userOTP })
        });
        if (response.ok) {
            console.log('User OTP sent to backend');
            // Handle further actions after sending user OTP
        } else {
            console.error('Failed to send User OTP to backend');
            // Handle error cases
        }} catch (error) {
            console.error('Error sending User OTP to backend:', error);
        }
        */
    });
document.getElementById('the-form').addEventListener('submit', function(event) {
    const password = document.getElementById('pass').value;
    const confirmPassword = document.getElementById('re-pass').value;
    if (password !== confirmPassword){
        event.preventDefault();
    };
});