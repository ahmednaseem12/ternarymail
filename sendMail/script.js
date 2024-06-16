document.addEventListener("DOMContentLoaded", function() {
    const userKey = 'userInformation';
    const maxSubmissions = 3;
    const submissionLimitDuration = 24 * 60 * 60 * 1000;

    function resetUserData() {
        return {
            submissions: [],
            lastResetTime: Date.now()
        };
    }

    let userData = JSON.parse(localStorage.getItem(userKey)) || resetUserData();
    let now = Date.now();

    if (now - userData.lastResetTime >= submissionLimitDuration) {
        userData = resetUserData();
        localStorage.setItem(userKey, JSON.stringify(userData));
    }

    document.getElementById('ternary-ct-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        if (userData.submissions.length >= maxSubmissions) {
            showToast("You've reached the maximum submission limit for today.", "danger");
            return;
        }

        const form = event.target;
        const formData = new FormData(form);

        const ipAddress = '127.0.0.1';
        const uniqueKey = generateUniqueKey();

        const newSubmission = {
            firstName: formData.get("first_name"),
            lastName: formData.get("last_name"),
            email: formData.get("email"),
            discord: formData.get("00NSu000000IwNJ"),
            demo: formData.get("00NSu000000IwWz"),
            hear: formData.get("00NSu000000Iwbp"),
            link: formData.get("url"),
            ipAddress: ipAddress,
            key: uniqueKey,
            submissionTime: now
        };

        userData.submissions.push(newSubmission);
        localStorage.setItem(userKey, JSON.stringify(userData));

        if (userData.submissions.length >= maxSubmissions) {
            showToast("You've reached the maximum submission limit for today.", "danger");
        } else {
            showToast("Submission successful.", "success");
            await sendEmail(newSubmission.email, newSubmission.firstName);
        }

        form.reset();
    });

    function generateUniqueKey() {
        return Math.random().toString(36).substr(2, 9);
    }

    function showToast(message, type) {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `custom-toast ${type}`;
        toast.style.cssText = `
            display: flex;
            align-items: center;
            background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 10px 20px;
            margin-bottom: 10px;
            border-radius: 5px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            animation: fadein 0.5s, fadeout 0.5s ${type === 'success' ? '2.5s' : '3.5s'} forwards;
        `;
        
        toast.innerHTML = `
            <div>${message}</div>
            <button type="button" style="background: none; border: none; color: white; font-size: 16px; margin-left: auto; cursor: pointer;">&times;</button>
        `;

        toastContainer.appendChild(toast);

        toast.querySelector('button').addEventListener('click', () => {
            toast.remove();
        });

        setTimeout(() => {
            toast.remove();
        }, type === 'success' ? 3000 : 4000);
    }

    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        @keyframes fadein {
            from {opacity: 0;}
            to {opacity: 1;}
        }
        @keyframes fadeout {
            from {opacity: 1;}
            to {opacity: 0;}
        }
    `;
    document.head.appendChild(styleSheet);

    async function sendEmail(toEmail, userName) {
        try {
            const response = await fetch('http://localhost:4000/send-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: toEmail, name: userName })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Error: ${response.statusText}, ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            console.log('Email sent successfully:', data);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }
});