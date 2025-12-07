import fs from 'fs';
import path from 'path';

// Define the shape of a verification request
export interface VerificationRequest {
  id: string;
  code: string;
  requesterName: string;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: number;
  requesterId?: string;
  ownerId?: string;
}

const DB_PATH = path.join(process.cwd(), 'src', 'data', 'requests.json');

// Ensure DB exists
function ensureDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([]));
  }
}

// Read all requests
export function getRequests(): VerificationRequest[] {
  ensureDB();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write requests
function saveRequests(requests: VerificationRequest[]) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(requests, null, 2));
}

// Add a new request
export function createRequest(request: VerificationRequest) {
  const requests = getRequests();
  // Filter out old requests (> 1 hour) to keep DB small
  const cleanRequests = requests.filter(r => Date.now() - r.timestamp < 3600000);
  cleanRequests.push(request);
  saveRequests(cleanRequests);
  return request;
}

// Update a request
export function updateRequest(id: string, updates: Partial<VerificationRequest>) {
  const requests = getRequests();
  const index = requests.findIndex(r => r.id === id);
  if (index !== -1) {
    requests[index] = { ...requests[index], ...updates };
    saveRequests(requests);
    return requests[index];
  }
  return null;
}

// Get pending request for a specific code
export function getPendingRequestForCode(code: string): VerificationRequest | undefined {
  const requests = getRequests();
  // Return the most recent pending request for this code
  return requests
    .filter(r => r.code === code && r.status === 'pending')
    .sort((a, b) => b.timestamp - a.timestamp)[0];
}

// Get request by ID
export function getRequestById(id: string): VerificationRequest | undefined {
  const requests = getRequests();
  return requests.find(r => r.id === id);
}
