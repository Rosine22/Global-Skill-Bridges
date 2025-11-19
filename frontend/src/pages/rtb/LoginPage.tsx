import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function RTBLoginPage() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [nameForCreate, setNameForCreate] = useState('');

  const { requestRtbCode, verifyRtbCode } = useAuth();
  const navigate = useNavigate();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await requestRtbCode(email);
      if (res.success) setCodeSent(true);
      else setError(res.message || 'Failed to send code');
    } catch {
      setError('Unexpected error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await verifyRtbCode(email, code, nameForCreate || undefined);
      if (res.success) {
        navigate('/dashboard');
      } else {
        setError(res.message || 'Invalid or expired code');
      }
    } catch {
      setError('Unexpected error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-teal-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">RTB Sign-In</h2>
          <p className="mt-2 text-sm text-gray-600">Enter your RTB email to receive a one-time sign-in code</p>
        </div>

        <form className="mt-8 bg-white p-8 rounded-xl shadow" onSubmit={codeSent ? handleVerify : handleSend}>
          {error && <div className="mb-4 text-sm text-red-600">{error}</div>}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RTB Email</label>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="you@rtb.gov.rw" />
              </div>
            </div>

            {codeSent && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enter Code</label>
                  <div className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-gray-400" />
                    <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="123456" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (optional)</label>
                  <input value={nameForCreate} onChange={(e) => setNameForCreate(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="RTB Admin Name (used if creating account)" />
                </div>
              </>
            )}
          </div>

          <div className="mt-6">
            <button type="submit" disabled={loading} className="w-full bg-teal-600 text-white py-2 rounded">
              {loading ? (codeSent ? 'Verifying...' : 'Sending...') : (codeSent ? 'Verify Code' : 'Send Code')}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-600">
            <Link to="/admin/login" className="text-teal-600 hover:underline">Back to Admin login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RTBLoginPage;
