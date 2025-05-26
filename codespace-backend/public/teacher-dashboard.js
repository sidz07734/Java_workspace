// Teacher Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Check if logged in user is an admin
  checkAdminStatus();
  
  // Load dashboard stats and student data
  loadDashboardStats();
  loadAllStudents();
  
  // Set up modal close button
  const closeBtn = document.querySelector('.close');
  if (closeBtn) {
    closeBtn.onclick = function() {
      document.getElementById('codeModal').style.display = 'none';
    }
  }
  
  // Close modal when clicking outside
  window.onclick = function(event) {
    const modal = document.getElementById('codeModal');
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
});

async function checkAdminStatus() {
  try {
    const response = await fetch('http://localhost:3001/check-admin', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.isAdmin) {
      // Redirect non-admin users
      alert('Access denied. You need teacher privileges to access this page.');
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error checking admin status:', error);
    alert('Error verifying your access privileges. Please log in again.');
    window.location.href = 'index.html';
  }
}

async function loadDashboardStats() {
  try {
    const response = await fetch('http://localhost:3001/admin/dashboard-stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      document.getElementById('totalStudents').textContent = data.totalStudents;
      document.getElementById('totalSubmissions').textContent = data.totalSubmissions;
      document.getElementById('activeToday').textContent = data.activeToday;
    } else {
      console.error('Failed to load stats:', data.error);
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  }
}

async function loadAllStudents() {
  try {
    const response = await fetch('http://localhost:3001/admin/students', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      populateStudentTable(data.students);
    } else {
      console.error('Failed to load students:', data.error);
    }
  } catch (error) {
    console.error('Error fetching students:', error);
  }
}

function populateStudentTable(students) {
  const tableBody = document.getElementById('studentTableBody');
  tableBody.innerHTML = '';
  
  if (!students || students.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="4">No students found</td></tr>';
    return;
  }
  
  students.forEach(student => {
    const row = document.createElement('tr');
    
    const lastActiveDate = new Date(student.last_active).toLocaleString();
    
    row.innerHTML = `
      <td>${student.username}</td>
      <td>${student.submission_count}</td>
      <td>${lastActiveDate}</td>
      <td>
        <button class="view-btn" onclick="viewStudentCodes(${student.id}, '${student.username}')">View Codes</button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

async function searchStudent() {
  const searchTerm = document.getElementById('searchInput').value.trim();
  
  if (searchTerm === '') {
    loadAllStudents();
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3001/admin/search-student?term=${searchTerm}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok) {
      populateStudentTable(data.students);
    } else {
      console.error('Search failed:', data.error);
    }
  } catch (error) {
    console.error('Error searching students:', error);
  }
}

async function viewStudentCodes(studentId, studentName) {
  try {
    const response = await fetch(`http://localhost:3001/admin/student-codes/${studentId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (response.ok && data.codes && data.codes.length > 0) {
      // Display the first code by default
      showCodeInModal(data.codes[0], studentName);
    } else {
      alert('No code submissions found for this student.');
    }
  } catch (error) {
    console.error('Error fetching student codes:', error);
    alert('Error loading student code submissions.');
  }
}

function showCodeInModal(codeData, studentName) {
  const modal = document.getElementById('codeModal');
  const modalStudentName = document.getElementById('modalStudentName');
  const modalTimestamp = document.getElementById('modalTimestamp');
  const modalCodeContent = document.getElementById('modalCodeContent');
  const modalAnalysisContent = document.getElementById('modalAnalysisContent');
  
  modalStudentName.textContent = `Student: ${studentName}`;
  
  const timestamp = new Date(codeData.created_at).toLocaleString();
  modalTimestamp.textContent = `Submitted: ${timestamp}`;
  
  modalCodeContent.textContent = codeData.code_content;
  
  // If there's analysis data, display it
  if (codeData.analysis_result) {
    modalAnalysisContent.innerHTML = `
      <h3>Analysis Result</h3>
      <div>${codeData.analysis_result}</div>
    `;
    modalAnalysisContent.style.display = 'block';
  } else {
    modalAnalysisContent.style.display = 'none';
  }
  
  modal.style.display = 'block';
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