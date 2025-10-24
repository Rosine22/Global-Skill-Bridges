import { useUserContext } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';

function TestEmployerData() {
  const { employerProfiles, submitEmployerProfile } = useUserContext();
  const { user } = useAuth();

  const addTestEmployer = () => {
    submitEmployerProfile({
      companyName: 'Test Company from Test Page',
      email: 'test@example.com',
      phone: '+250 788 123 456',
      industry: 'Technology',
      companySize: '11-50 employees',
      location: 'Kigali, Rwanda',
      website: 'https://testcompany.com',
      companyRegistration: 'RW-TEST-001',
      description: 'This is a test company added from the test page.',
      contactPerson: 'Test Person',
      address: '123 Test Street',
      city: 'Kigali',
      country: 'Rwanda',
      postalCode: '12345',
      benefits: ['Health Insurance', 'Remote Work'],
      workCulture: 'Test culture',
      remotePolicy: 'hybrid',
      founded: '2023'
    });
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Test Employer Data</h1>
      
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Current User</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Employer Profiles ({employerProfiles.length})</h2>
          <button
            onClick={addTestEmployer}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Test Employer
          </button>
        </div>
        
        {employerProfiles.length === 0 ? (
          <p className="text-gray-500">No employer profiles found.</p>
        ) : (
          <div className="space-y-4">
            {employerProfiles.map((profile) => (
              <div key={profile.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{profile.companyName}</h3>
                  <span className={`px-2 py-1 rounded text-sm ${
                    profile.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    profile.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {profile.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{profile.email} | {profile.industry}</p>
                <p className="text-sm text-gray-600">{profile.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Submitted: {new Date(profile.submittedAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Raw Data (JSON)</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
          {JSON.stringify(employerProfiles, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default TestEmployerData;
