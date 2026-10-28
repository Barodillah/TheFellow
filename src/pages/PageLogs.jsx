import React, { useState, useEffect } from 'react';
import { Activity, Users, FileText, Filter, X, ChevronRight, ChevronDown, ChevronUp, Monitor, Clock, ExternalLink, RefreshCw } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function PageLogs() {
  useDocumentTitle('Page Logs Admin');
  const [activeTab, setActiveTab] = useState('recent');
  const [recentLogs, setRecentLogs] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topPages, setTopPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [hideGuests, setHideGuests] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [hiddenUsers, setHiddenUsers] = useState([]);
  const [hiddenPages, setHiddenPages] = useState([]);
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  // Drill-down Modals
  const [selectedUser, setSelectedUser] = useState(null); // { id, name, session_id }
  const [userTopPages, setUserTopPages] = useState([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [selectedPage, setSelectedPage] = useState(null); // { url, title }
  const [pageTopUsers, setPageTopUsers] = useState([]);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'https://www.incsmsociety.site/api';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [recentRes, topUsersRes, topPagesRes] = await Promise.all([
        fetch(`${API_BASE}/get_page_logs.php?action=recent&limit=50`).then(r => r.json()),
        fetch(`${API_BASE}/get_page_logs.php?action=top_users&limit=20&hide_guests=${hideGuests}`).then(r => r.json()),
        fetch(`${API_BASE}/get_page_logs.php?action=top_pages&limit=20&hide_guests=${hideGuests}`).then(r => r.json())
      ]);

      if (recentRes.status === 'success') setRecentLogs(recentRes.data);
      if (topUsersRes.status === 'success') setTopUsers(topUsersRes.data);
      if (topPagesRes.status === 'success') setTopPages(topPagesRes.data);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [hideGuests]);

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
    setUserTopPages([]);
    try {
      const url = `${API_BASE}/get_page_logs.php?action=user_top_pages&limit=20` + 
                  (user.user_id ? `&user_id=${user.user_id}` : `&session_id=${user.session_id}`);
      const res = await fetch(url).then(r => r.json());
      if (res.status === 'success') setUserTopPages(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePageClick = async (page) => {
    setSelectedPage(page);
    setIsPageModalOpen(true);
    setPageTopUsers([]);
    try {
      const url = `${API_BASE}/get_page_logs.php?action=page_top_users&limit=20&page_url=${encodeURIComponent(page.page_url)}`;
      const res = await fetch(url).then(r => r.json());
      if (res.status === 'success') setPageTopUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    d.setHours(d.getHours() + 7);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const displayedRecent = recentLogs.filter(log => !hiddenUsers.includes(log.user_id || log.session_id) && !hiddenPages.includes(log.page_url));
  const displayedTopUsers = topUsers.filter(u => !hiddenUsers.includes(u.user_id || u.session_id));
  const displayedTopPages = topPages.filter(p => !hiddenPages.includes(p.page_url));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Page Logs Analytics
          </h1>
          <p className="text-gray-500 mt-1">Pantau lalu lintas kunjungan dan aktivitas pengguna secara real-time.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-4 md:mt-0">
          <button 
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 shadow-sm font-medium disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition-colors border border-indigo-200 shadow-sm font-medium"
          >
            <Filter className="w-4 h-4" /> Filter Data
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Card 1: Recent Logs (Takes 1 column, maybe full width on small) */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500" /> Log Terakhir (50)
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {displayedRecent.map((log, idx) => (
                <div key={idx} className="p-3 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {log.user_name || 'Guest User'}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 truncate">{log.page_title || log.page_url}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{log.ip_address}</span>
                    <span className="text-[10px] text-gray-400 truncate max-w-[150px]" title={log.user_agent}>{log.user_agent}</span>
                  </div>
                </div>
              ))}
              {displayedRecent.length === 0 && <div className="text-center p-4 text-gray-500 text-sm">Belum ada data log kunjungan.</div>}
            </div>
          </div>

          {/* Column 2 & 3: Top Users and Top Pages */}
          <div className="lg:col-span-2 flex flex-col gap-6 h-[600px]">
            
            {/* Top Users */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" /> Top Users
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {displayedTopUsers.map((u, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handleUserClick(u)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 cursor-pointer transition-colors border border-gray-50 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 group-hover:text-blue-700">{u.user_name || 'Guest User'}</div>
                          <div className="text-xs text-gray-500">{u.user_id ? 'Registered Fellow' : `Session: ${u.session_id.substring(0,8)}...`}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">{u.visit_count} visit</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                      </div>
                    </div>
                  ))}
                  {displayedTopUsers.length === 0 && <div className="text-center text-gray-500 text-sm py-4">Tidak ada data user.</div>}
                </div>
              </div>
            </div>

            {/* Top Pages */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-500" /> Top Pages
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  {displayedTopPages.map((p, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => handlePageClick(p)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors border border-gray-50 group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm shrink-0">
                          {idx + 1}
                        </div>
                        <div className="truncate">
                          <div className="font-medium text-gray-900 group-hover:text-purple-700 truncate">{p.page_title || 'Untitled Page'}</div>
                          <div className="text-xs text-gray-500 truncate">{p.page_url}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">{p.visit_count} views</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-500" />
                      </div>
                    </div>
                  ))}
                  {displayedTopPages.length === 0 && <div className="text-center text-gray-500 text-sm py-4">Tidak ada data halaman.</div>}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FILTER MODAL */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-lg text-gray-900">Filter Analitik</h3>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={hideGuests}
                  onChange={(e) => setHideGuests(e.target.checked)}
                  className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Sembunyikan Guest</div>
                  <div className="text-xs text-gray-500">Hanya tampilkan laporan untuk pengguna yang login.</div>
                </div>
              </label>

              {/* Accordion User */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setExpandedAccordion(expandedAccordion === 'users' ? null : 'users')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900">Sembunyikan User Tertentu</div>
                  {expandedAccordion === 'users' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {expandedAccordion === 'users' && (
                  <div className="p-4 bg-white max-h-60 overflow-y-auto space-y-3">
                    {topUsers.map((u, idx) => {
                      const identifier = u.user_id || u.session_id;
                      const isHidden = hiddenUsers.includes(identifier);
                      return (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={isHidden}
                            onChange={(e) => {
                              if (e.target.checked) setHiddenUsers([...hiddenUsers, identifier]);
                              else setHiddenUsers(hiddenUsers.filter(id => id !== identifier));
                            }}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div className="text-sm text-gray-700 group-hover:text-indigo-600">
                            {u.user_name || 'Guest User'} <span className="text-xs text-gray-400">({u.user_id ? 'Fellow' : `Sess: ${u.session_id.substring(0,6)}`})</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion Page */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => setExpandedAccordion(expandedAccordion === 'pages' ? null : 'pages')}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <div className="font-medium text-gray-900">Sembunyikan Halaman Tertentu</div>
                  {expandedAccordion === 'pages' ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                </button>
                {expandedAccordion === 'pages' && (
                  <div className="p-4 bg-white max-h-60 overflow-y-auto space-y-3">
                    {topPages.map((p, idx) => {
                      const isHidden = hiddenPages.includes(p.page_url);
                      return (
                        <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={isHidden}
                            onChange={(e) => {
                              if (e.target.checked) setHiddenPages([...hiddenPages, p.page_url]);
                              else setHiddenPages(hiddenPages.filter(url => url !== p.page_url));
                            }}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div className="text-sm text-gray-700 group-hover:text-indigo-600 truncate max-w-[300px]" title={p.page_title || p.page_url}>
                            {p.page_title || p.page_url}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium transition-colors"
              >
                Terapkan Filter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER TOP PAGES MODAL */}
      {isUserModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-blue-50/50">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{selectedUser.user_name || 'Guest User'}</h3>
                <p className="text-xs text-gray-500">Halaman yang paling sering dikunjungi</p>
              </div>
              <button onClick={() => setIsUserModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              {userTopPages.length === 0 ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {userTopPages.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="overflow-hidden pr-4">
                        <div className="font-medium text-gray-900 truncate">{p.page_title || 'Untitled Page'}</div>
                        <div className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                          <ExternalLink className="w-3 h-3" /> {p.page_url.replace(/https?:\/\/[^\/]+/, '')}
                        </div>
                      </div>
                      <span className="font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg shrink-0">{p.visit_count}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PAGE TOP USERS MODAL */}
      {isPageModalOpen && selectedPage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-purple-50/50">
              <div className="overflow-hidden pr-4">
                <h3 className="font-semibold text-lg text-gray-900 truncate">{selectedPage.page_title || 'Untitled Page'}</h3>
                <p className="text-xs text-gray-500">Daftar pengguna teratas halaman ini</p>
              </div>
              <button onClick={() => setIsPageModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 bg-white rounded-full shadow-sm shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-5">
              {pageTopUsers.length === 0 ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {pageTopUsers.map((u, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                          {u.user_name ? u.user_name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{u.user_name || 'Guest User'}</div>
                          <div className="text-xs text-gray-500">{u.user_id ? u.user_role : `Session: ${u.session_id.substring(0,8)}`}</div>
                        </div>
                      </div>
                      <span className="font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-lg shrink-0">{u.visit_count}x</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
