'use client';

import { useState, useEffect } from 'react';
import { HiDocumentArrowUp, HiDocumentText, HiTrash, HiDocumentCheck } from 'react-icons/hi2';
import { createClient } from '@/lib/supabase/client';

interface Syllabus {
  id: string;
  subject: string;
  grade_level: string;
  academic_term: string;
  file_url: string;
  file_type: string;
  raw_text_content: string | null;
  created_at: string;
}

export default function SyllabusManagementPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('Grade 9');
  const [term, setTerm] = useState('Fall 2026');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  // Load existing syllabi from Supabase
  useEffect(() => {
    loadSyllabi();
  }, []);

  async function loadSyllabi() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('syllabi')
      .select('*')
      .eq('instructor_id', user.id)
      .order('created_at', { ascending: false });

    if (data) setSyllabi(data);
  }

  async function handleUpload() {
    if (!subject.trim()) { setError('Please enter a subject name.'); return; }
    if (!selectedFile) { setError('Please select a file to upload.'); return; }

    setIsUploading(true);
    setError('');
    setSuccess('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // 1. Upload file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop() || 'pdf';
      const filePath = `${user.id}/${Date.now()}_${selectedFile.name}`;

      const { error: uploadError } = await supabase.storage
        .from('secure_exam_materials')
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false,
        });

      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('secure_exam_materials')
        .getPublicUrl(filePath);

      // 3. Determine file type
      let fileType = 'pdf';
      if (fileExt === 'docx' || fileExt === 'doc') fileType = 'docx';
      else if (['jpg', 'jpeg', 'png'].includes(fileExt)) fileType = 'image';

      // 4. Insert record into syllabi table
      const { error: dbError } = await supabase
        .from('syllabi')
        .insert({
          instructor_id: user.id,
          subject: subject.trim(),
          grade_level: gradeLevel,
          academic_term: term,
          file_url: urlData.publicUrl || filePath,
          file_type: fileType,
          raw_text_content: null, // Text extraction would be done server-side
        });

      if (dbError) throw new Error(`Database error: ${dbError.message}`);

      setSuccess(`"${subject}" uploaded successfully!`);
      setSubject('');
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Reload the list
      await loadSyllabi();
    } catch (err: any) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    const { error } = await supabase.from('syllabi').delete().eq('id', id);
    if (!error) {
      setSyllabi(syllabi.filter(s => s.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Syllabus Management</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Upload curriculum documents for AI to generate exams from.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="glass-card p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Upload New Syllabus</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">{success}</div>
          )}

          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Advanced Physics"
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Grade Level</label>
                <select
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                >
                  <option>Grade 9</option>
                  <option>Grade 10</option>
                  <option>Grade 11</option>
                  <option>Grade 12</option>
                  <option>Undergrad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">Term</label>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rose-500"
                >
                  <option>Fall 2026</option>
                  <option>Spring 2027</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Exam Document (PDF/DOCX/Images)</label>
              <div className="mt-2 flex justify-center rounded-xl border border-dashed border-zinc-700 px-6 py-8 hover:bg-zinc-800/30 transition-colors cursor-pointer relative overflow-hidden group">
                <div className="text-center relative z-10">
                  <HiDocumentArrowUp className="mx-auto h-8 w-8 text-zinc-500 group-hover:text-rose-400 transition-colors" />
                  <div className="mt-4 flex flex-col sm:flex-row items-center text-sm leading-6 text-zinc-400">
                    <span className="relative cursor-pointer rounded-md font-semibold text-rose-400 hover:text-rose-300">
                      <span>{selectedFile ? selectedFile.name : 'Upload a file'}</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 15 * 1024 * 1024) {
                              setError('File must be under 15MB.');
                              return;
                            }
                            setSelectedFile(file);
                            setError('');
                          }
                        }}
                      />
                    </span>
                    {!selectedFile && <p className="sm:pl-1">or drag and drop</p>}
                  </div>
                  <p className="text-xs leading-5 text-zinc-500 mt-1">PDF, Word, or Photographs (up to 15MB)</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 disabled:bg-rose-500/50 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                'Upload & Process Syllabus'
              )}
            </button>
          </form>
        </div>

        {/* Existing Syllabi List — Now from Supabase */}
        <div className="lg:col-span-2 glass-card overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-zinc-800/50">
            <h2 className="text-lg font-semibold">Active Syllabi Library</h2>
          </div>
          <div className="flex-1 overflow-x-auto">
            {syllabi.length === 0 ? (
              <div className="p-12 text-center text-zinc-500">
                <HiDocumentText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p>No syllabi uploaded yet. Upload your first curriculum document to get started.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/30 border-b border-zinc-800/50">
                  <tr>
                    <th className="px-6 py-3 font-medium">Subject</th>
                    <th className="px-6 py-3 font-medium">Grade / Term</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {syllabi.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/20 transition-colors">
                      <td className="px-6 py-4 font-medium flex items-center gap-3">
                        <div className="p-2 bg-rose-500/10 rounded-lg">
                          <HiDocumentText className="w-4 h-4 text-rose-400" />
                        </div>
                        {item.subject}
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {item.grade_level} • {item.academic_term}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <HiDocumentCheck className="w-3.5 h-3.5" />
                          Ready for AI
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-zinc-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
