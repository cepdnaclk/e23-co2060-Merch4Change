import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useSearch } from "../../hooks/useSearch";
import { Search, Loader2 } from "lucide-react";
import SearchResultItem from "../../components/TopNavbar/search/SearchResultItem";
import { searchAll } from "../../api/searchService";
import "./SearchPage.css";

export default function SearchPage() {
  const { query, setQuery, results, loading, hasMore, loadMore } = useSearch();
  const navigate = useNavigate();

  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMore]);

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem("m4c_recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [suggestions, setSuggestions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [prediction, setPrediction] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    if (!query || query.length < 2 || !results) {
      setPrediction("");
      return;
    }

    const lowerQuery = query.toLowerCase();
    let match = "";
    
    if (results.charities?.length && results.charities[0].name.toLowerCase().startsWith(lowerQuery)) {
      match = results.charities[0].name;
    } else if (results.projects?.length && results.projects[0].name.toLowerCase().startsWith(lowerQuery)) {
      match = results.projects[0].name;
    } else if (results.products?.length && results.products[0].name.toLowerCase().startsWith(lowerQuery)) {
      match = results.products[0].name;
    } else if (results.users?.length && results.users[0].userName.toLowerCase().startsWith(lowerQuery)) {
      match = results.users[0].userName;
    }

    if (match) {
      setPrediction(query + match.substring(query.length));
    } else {
      setPrediction("");
    }
  }, [query, results]);

  useEffect(() => {
    if (recentSearches.length === 0) {
      // Fetch some generic results to use as random suggestions
      searchAll("a")
        .then((res) => {
          if (res.data?.data?.results?.users) {
            const users = res.data.data.results.users;
            // Shuffle and pick 3
            const shuffled = [...users].sort(() => 0.5 - Math.random());
            setSuggestions(shuffled.slice(0, 3).map((u) => ({ category: "users", item: u })));
          }
        })
        .catch(() => {});
    }
  }, [recentSearches.length]);

  function handleSelect({ category, item }) {
    const searchEntry = { category, item, id: item.id || item.title || item.userName || Math.random().toString() };
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.id !== searchEntry.id);
      const next = [searchEntry, ...filtered].slice(0, 10);
      localStorage.setItem("m4c_recent_searches", JSON.stringify(next));
      return next;
    });

    if (category === "users") {
      if (item.userName) navigate(`/profile/${item.userName}`);
      else navigate("/profile/me");
    }
    else if (category === "charities") {
      if (item.userName) navigate(`/profile/${item.userName}`);
      else navigate("/under-construction");
    }
    else if (category === "projects") {
      if (item.charityUserName) navigate(`/profile/${item.charityUserName}/projects`);
      else navigate("/under-construction");
    }
    else if (category === "products") navigate("/marketplace");
  }

  const showUsers = (filter === "all" || filter === "users") && results?.users?.length > 0;
  const showCharities = (filter === "all" || filter === "charities") && results?.charities?.length > 0;
  const showProjects = (filter === "all" || filter === "projects") && results?.projects?.length > 0;
  const showProducts = (filter === "all" || filter === "products") && results?.products?.length > 0;

  const flattenedItems = React.useMemo(() => {
    let items = [];
    if (query.length >= 2 && results) {
      if (showUsers) items = items.concat(results.users.map(u => ({ category: 'users', item: u })));
      if (showCharities) items = items.concat(results.charities.map(c => ({ category: 'charities', item: c })));
      if (showProjects) items = items.concat(results.projects.map(p => ({ category: 'projects', item: p })));
      if (showProducts) items = items.concat(results.products.map(pr => ({ category: 'products', item: pr })));
    } else if (query.length < 2) {
      if (recentSearches.length > 0) items = recentSearches;
      else if (suggestions.length > 0) items = suggestions;
    }
    return items;
  }, [query, results, showUsers, showCharities, showProjects, showProducts, recentSearches, suggestions]);

  useEffect(() => {
    setSelectedIndex(-1);
  }, [flattenedItems.length, query]);

  const getIndex = (category, item) => flattenedItems.findIndex(i => i.category === category && i.item === item);

  function handleKeyDown(e) {
    if ((e.key === "Tab" || e.key === "ArrowRight") && prediction && prediction.toLowerCase().startsWith(query.toLowerCase()) && prediction !== query) {
      e.preventDefault();
      setQuery(prediction);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < flattenedItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < flattenedItems.length) {
        handleSelect(flattenedItems[selectedIndex]);
      } else if (flattenedItems.length > 0) {
        handleSelect(flattenedItems[0]);
      }
    }
  }

  const anyResults = results && (results.users?.length || results.charities?.length || results.projects?.length || results.products?.length);
  const anyVisibleResults = showUsers || showCharities || showProjects || showProducts;

  return (
    <div className={`luminous-app`}>
      <div className="lum-layout">
        <Sidebar setIsSidebarCollapsed={() => {}} />
        <main className="lum-main-content">
          <div className="search-page-container">
            <div className="search-page-header">
               <div className="search-page-input-wrapper">
                 <Search className="search-page-icon" size={15} color="#888" style={{ zIndex: 2 }} />
                 
                 {prediction && prediction.toLowerCase().startsWith(query.toLowerCase()) && prediction !== query && (
                   <input
                     className="search-page-input"
                     style={{
                       position: 'absolute',
                       top: 0,
                       left: 0,
                       color: '#ccc',
                       background: 'transparent',
                       zIndex: 0,
                       pointerEvents: 'none'
                     }}
                     value={prediction}
                     readOnly
                   />
                 )}

                 <input 
                   type="text" 
                   className="search-page-input"
                   placeholder="Search causes, charities, projects, people..."
                   value={query}
                   onChange={(e) => setQuery(e.target.value)}
                   onKeyDown={handleKeyDown}
                   autoFocus
                   style={{ background: 'transparent', zIndex: 1, position: 'relative' }}
                 />
                 {loading && <Loader2 className="search-page-spinner" size={20} color="#888" style={{ zIndex: 2 }} />}
               </div>

               {query.length >= 2 && results && (
                 <div className="search-page-filters" style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                   {['all', 'users', 'charities', 'projects', 'products'].map(f => (
                     <button
                       key={f}
                       onClick={() => setFilter(f)}
                       style={{
                         padding: '6px 12px',
                         borderRadius: '20px',
                         border: '1px solid #f0f0f0',
                         background: filter === f ? '#4A24E1' : 'white',
                         color: filter === f ? 'white' : '#666',
                         cursor: 'pointer',
                         textTransform: 'capitalize',
                         fontSize: '13px'
                       }}
                     >
                       {f}
                     </button>
                   ))}
                 </div>
               )}
            </div>

            <div className="search-page-results-wrapper">
              {query.length >= 2 ? (
                loading && !results ? (
                  <div className="search-page-empty">
                    <div className="search-page-spinner-large"><Loader2 size={32} color="#4A24E1" /></div>
                    <p>Searching...</p>
                  </div>
                ) : anyVisibleResults ? (
                  <div className="search-page-results-list">
                    {showUsers && (
                      <div className="search-page-section">
                        <div className="search-page-section-header">USERS</div>
                        <div className="search-page-grid">
                          {results.users.map((u) => (
                            <div key={`u-${u.id}`} className={`search-page-result-card ${selectedIndex === getIndex('users', u) ? 'selected' : ''}`} onClick={() => handleSelect({ category: 'users', item: u })}>
                              <SearchResultItem item={u} category="users" query={query} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showCharities && (
                      <div className="search-page-section">
                        <div className="search-page-section-header">CHARITIES</div>
                        <div className="search-page-grid">
                          {results.charities.map((c) => (
                            <div key={`c-${c.id}`} className={`search-page-result-card ${selectedIndex === getIndex('charities', c) ? 'selected' : ''}`} onClick={() => handleSelect({ category: 'charities', item: c })}>
                              <SearchResultItem item={c} category="charities" query={query} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showProjects && (
                      <div className="search-page-section">
                        <div className="search-page-section-header">PROJECTS</div>
                        <div className="search-page-grid">
                          {results.projects.map((p) => (
                            <div key={`p-${p.id}`} className={`search-page-result-card ${selectedIndex === getIndex('projects', p) ? 'selected' : ''}`} onClick={() => handleSelect({ category: 'projects', item: p })}>
                              <SearchResultItem item={p} category="projects" query={query} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showProducts && (
                      <div className="search-page-section">
                        <div className="search-page-section-header">PRODUCTS</div>
                        <div className="search-page-grid">
                          {results.products.map((pr) => (
                            <div key={`pr-${pr.id}`} className={`search-page-result-card ${selectedIndex === getIndex('products', pr) ? 'selected' : ''}`} onClick={() => handleSelect({ category: 'products', item: pr })}>
                              <SearchResultItem item={pr} category="products" query={query} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {hasMore && (
                      <div ref={lastElementRef} style={{ textAlign: "center", padding: "20px 0", gridColumn: "1 / -1" }}>
                        <Loader2 size={24} color="#4A24E1" className="search-page-spinner-large" style={{ margin: "0 auto" }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="search-page-empty">
                    <div className="search-page-empty-icon">🔍</div>
                    <h3>No results for "{query}"</h3>
                    <p>{filter !== "all" ? `No results found in ${filter}.` : "Try searching for a charity, project, or product."}</p>
                  </div>
                )
              ) : recentSearches.length > 0 ? (
                <div className="search-page-results-list">
                  <div className="search-page-section">
                    <div className="search-page-section-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>RECENT SEARCHES</span>
                      <button
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem("m4c_recent_searches");
                        }}
                        style={{ background: "none", border: "none", color: "#4A24E1", cursor: "pointer", fontSize: "13px", fontWeight: "bold", padding: 0 }}
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="search-page-grid">
                      {recentSearches.map((rs, idx) => (
                        <div key={`rs-${rs.id}-${idx}`} className={`search-page-result-card ${selectedIndex === getIndex(rs.category, rs.item) ? 'selected' : ''}`} onClick={() => handleSelect({ category: rs.category, item: rs.item })}>
                          <SearchResultItem item={rs.item} category={rs.category} query="" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="search-page-results-list">
                  <div className="search-page-section">
                    <div className="search-page-section-header">SUGGESTED FOR YOU</div>
                    <div className="search-page-grid">
                      {suggestions.map((sug, idx) => (
                        <div key={`sug-${sug.item.id || idx}`} className={`search-page-result-card ${selectedIndex === getIndex(sug.category, sug.item) ? 'selected' : ''}`} onClick={() => handleSelect({ category: sug.category, item: sug.item })}>
                          <SearchResultItem item={sug.item} category={sug.category} query="" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="search-page-empty">
                  <p style={{ color: "#888", marginTop: "40px" }}>No recent searches</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
