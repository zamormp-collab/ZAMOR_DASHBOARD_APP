/**
 * Incidents Management - Client-side JavaScript
 * Handles UI interactions, form submission, and API calls
 */

const API_URL = '/api/incidents';
let modal = null;
let currentIncidentId = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  modal = new bootstrap.Modal(document.getElementById('incidentModal'));
  
  // Event listeners
  document.getElementById('newIncidentBtn').addEventListener('click', openNewIncidentModal);
  document.getElementById('incidentForm').addEventListener('submit', handleFormSubmit);
  
  // Reset form when modal is closed
  document.getElementById('incidentModal').addEventListener('hidden.bs.modal', resetForm);
  
  // Load incidents on page load
  loadIncidents();
});

/**
 * Load and display all incidents
 */
async function loadIncidents() {
  try {
    showSpinner(true);
    
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      displayIncidents(data.incidents);
    } else {
      showToast('Error loading incidents', 'danger');
    }
  } catch (error) {
    console.error('Error loading incidents:', error);
    showToast('Failed to load incidents: ' + error.message, 'danger');
  } finally {
    showSpinner(false);
  }
}

/**
 * Display incidents in table
 */
function displayIncidents(incidents) {
  const tbody = document.getElementById('incidentsTableBody');
  const emptyState = document.getElementById('emptyState');
  const tableContainer = document.getElementById('tableContainer');
  const incidentCount = document.getElementById('incidentCount');
  
  incidentCount.textContent = incidents.length;
  
  if (incidents.length === 0) {
    emptyState.style.display = 'block';
    tableContainer.style.display = 'none';
    return;
  }
  
  tbody.innerHTML = '';
  
  incidents.forEach(incident => {
    const row = document.createElement('tr');
    const severityClass = `severity-${incident.severity}`;
    const createdDate = new Date(incident.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    row.innerHTML = `
      <td><strong>#${incident.id}</strong></td>
      <td><strong>${escapeHtml(incident.title)}</strong></td>
      <td>
        <span class="text-muted" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="${escapeHtml(incident.description || '(no description)')}">
          ${truncate(incident.description || '(no description)', 50)}
        </span>
        <br>
        <small class="text-muted">${createdDate}</small>
      </td>
      <td>
        <span class="badge badge-custom ${severityClass}">
          ${incident.severity}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-warning" onclick="openEditIncidentModal(${incident.id})">
          ✎ Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="deleteIncident(${incident.id})">
          × Delete
        </button>
      </td>
    `;
    
    tbody.appendChild(row);
  });
  
  // Initialize tooltips for new elements
  initializeTooltips();
  
  emptyState.style.display = 'none';
  tableContainer.style.display = 'block';
}

/**
 * Open modal for new incident
 */
function openNewIncidentModal() {
  currentIncidentId = null;
  resetForm();
  document.getElementById('incidentModalLabel').textContent = 'New Incident';
  modal.show();
}

/**
 * Open modal for editing incident
 */
async function openEditIncidentModal(id) {
  try {
    currentIncidentId = id;
    
    const response = await fetch(`${API_URL}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch incident');
    }
    
    const data = await response.json();
    const incident = data.incident;
    
    // Populate form
    document.getElementById('incidentId').value = incident.id;
    document.getElementById('incidentTitle').value = incident.title;
    document.getElementById('incidentDescription').value = incident.description || '';
    document.getElementById('incidentSeverity').value = incident.severity;
    document.getElementById('incidentModalLabel').textContent = `Edit Incident #${incident.id}`;
    
    modal.show();
  } catch (error) {
    console.error('Error loading incident for edit:', error);
    showToast('Failed to load incident: ' + error.message, 'danger');
  }
}

/**
 * Handle form submission (Create or Update)
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  const title = document.getElementById('incidentTitle').value.trim();
  const description = document.getElementById('incidentDescription').value.trim();
  const severity = document.getElementById('incidentSeverity').value;
  
  // Validation
  if (!title) {
    showToast('Title is required', 'warning');
    return;
  }
  
  if (!severity) {
    showToast('Severity is required', 'warning');
    return;
  }
  
  try {
    showSubmitSpinner(true);
    
    const method = currentIncidentId ? 'PUT' : 'POST';
    const url = currentIncidentId ? `${API_URL}/${currentIncidentId}` : API_URL;
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        description,
        severity
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save incident');
    }
    
    const data = await response.json();
    const action = currentIncidentId ? 'updated' : 'created';
    
    showToast(`Incident ${action} successfully!`, 'success');
    modal.hide();
    loadIncidents();
    
  } catch (error) {
    console.error('Error submitting form:', error);
    showToast('Error: ' + error.message, 'danger');
  } finally {
    showSubmitSpinner(false);
  }
}

/**
 * Delete incident
 */
async function deleteIncident(id) {
  if (!confirm('Are you sure you want to delete this incident? This action cannot be undone.')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete incident');
    }
    
    showToast('Incident deleted successfully!', 'success');
    loadIncidents();
    
  } catch (error) {
    console.error('Error deleting incident:', error);
    showToast('Error: ' + error.message, 'danger');
  }
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.forEach(tooltipTriggerEl => {
    new bootstrap.Tooltip(tooltipTriggerEl);
  });
}

/**
 * Reset form to initial state
 */
function resetForm() {
  document.getElementById('incidentForm').reset();
  document.getElementById('incidentId').value = '';
  currentIncidentId = null;
}

/**
 * Show/hide loading spinner
 */
function showSpinner(show) {
  document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}

/**
 * Show/hide submit button spinner
 */
function showSubmitSpinner(show) {
  document.getElementById('submitBtnSpinner').style.display = show ? 'inline-block' : 'none';
  document.getElementById('submitBtnText').textContent = show ? 'Saving...' : 'Save Incident';
  document.querySelector('#incidentForm button[type="submit"]').disabled = show;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
  const toastContainer = document.querySelector('.toast-container');
  const toastId = 'toast-' + Date.now();
  
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `toast align-items-center text-white bg-${type} border-0`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  toastContainer.appendChild(toast);
  
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  // Remove toast element after it's hidden
  setTimeout(() => {
    toast.remove();
  }, 5000);
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Truncate text with ellipsis
 */
function truncate(text, maxLength) {
  if (!text) return '(empty)';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}
