async function analyzeCode() {
  const code = document.getElementById("codeInput").value;

  if (code.trim() === "") {
    alert("Please write some code first.");
    return;
  }

  document.getElementById("result").innerText = "Analyzing your code... Please wait.";

  try {
    const response = await fetch('http://localhost:3001/analyze-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code }),
      credentials: 'include'
    });

    const data = await response.json();

    if (response.ok) {
      document.getElementById("result").innerText = data.feedback;
    } else {
      document.getElementById("result").innerText = data.error || "Unknown error occurred.";
    }
  } catch (error) {
    console.error('Error contacting backend:', error);
    document.getElementById("result").innerText = "⚠️ Could not contact the server. Make sure it's running.";
  }
}

async function saveCode() {
  const code = document.getElementById("codeInput").value;
  
  if (code.trim() === "") {
    alert("Please write some code first.");
    return;
  }
  
  try {
    const response = await fetch('http://localhost:3001/save-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code }),
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById("result").innerText = "Code saved successfully!";
    } else {
      document.getElementById("result").innerText = data.error || "Failed to save code.";
    }
  } catch (error) {
    console.error('Error contacting backend:', error);
    document.getElementById("result").innerText = "⚠️ Could not contact the server. Make sure it's running.";
  }
}

async function logout() {
  if (confirm("Are you sure you want to logout?")) {
    try {
      const response = await fetch('http://localhost:3001/logout', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        // Redirect to login page
        window.location.href = 'index.html';
      } else {
        alert('Failed to logout. Please try again.');
      }
    } catch (error) {
      console.error('Logout error:', error);
      alert('Error occurred during logout. Please try again.');
    }
  }
}

// Check if the user is authenticated when the page loads
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const response = await fetch('http://localhost:3001/check-admin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    if (!response.ok) {
      // If not authenticated, redirect to login
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Authentication check error:', error);
    // If error, assume not authenticated and redirect
    window.location.href = 'index.html';
  }
});