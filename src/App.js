import React, { useState } from 'react';
import axios from 'axios';
import parse from 'html-react-parser';
import './App.css';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [articleContent, setArticleContent] = useState('');
    const [articleTitle, setArticleTitle] = useState('');
    const [searchAttempted, setSearchAttempted] = useState(false);
    const [previousArticles, setPreviousArticles] = useState([]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchAttempted(true);
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/search?q=${searchTerm}`);
            setResults(response.data.results);
        } catch (error) {
            console.error('Error fetching search results:', error);
        }
    };

    const handleResultClick = async (pageId) => {
        fetchArticle(pageId);
    };

    const fetchArticle = async (pageId) => {
        try {
            const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&pageid=${pageId}&format=json&origin=*`);
            if (articleContent) {
                setPreviousArticles((prev) => [...prev, { title: articleTitle, content: articleContent }]);
            }
            setArticleTitle(response.data.parse.title);
            setArticleContent(response.data.parse.text['*']);
        } catch (error) {
            console.error('Error fetching article content:', error);
        }
    };

    const handleBack = () => {
        if (previousArticles.length > 0) {
            const lastArticle = previousArticles[previousArticles.length - 1];
            setPreviousArticles(previousArticles.slice(0, -1)); // Remove the last article from the array
            setArticleContent(lastArticle.content);
            setArticleTitle(lastArticle.title);
        } else {
            setArticleContent('');
            setArticleTitle('');
        }
    };

    const renderContent = (htmlContent) => {
        return parse(htmlContent, {
            replace: (domNode) => {
                if (domNode.name === 'img' && domNode.attribs && domNode.attribs.src) {
                    const src = domNode.attribs.src.startsWith('http') 
                        ? domNode.attribs.src 
                        : `https:${domNode.attribs.src}`;
                    
                    return (
                        <img 
                            src={src} 
                            alt={articleTitle || 'Image'}
                            style={{
                                width: 'auto',
                                maxWidth: '80%',
                                maxHeight: '300px',
                                height: 'auto',
                                margin: '0 auto',
                                display: 'block'
                            }} 
                        />
                    );
                }

                if (domNode.name === 'a' && domNode.attribs && domNode.attribs.href) {
                    const href = domNode.attribs.href;
                    const pageTitleMatch = href.match(/\/wiki\/(.+)/);
                    
                    if (pageTitleMatch && pageTitleMatch[1]) {
                        const pageTitle = pageTitleMatch[1];

                        return (
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    fetchArticleByTitle(pageTitle);
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'blue',
                                    textDecoration: 'underline',
                                    cursor: 'pointer',
                                    padding: 0,
                                }}
                            >
                                {domNode.children[0]?.data || 'Link'}
                            </button>
                        );
                    }
                }

                return null;
            }
        });
    };

    const fetchArticleByTitle = async (title) => {
        try {
            const response = await axios.get(`https://en.wikipedia.org/w/api.php?action=parse&page=${title}&format=json&origin=*`);
            if (articleContent) {
                setPreviousArticles((prev) => [...prev, { title: articleTitle, content: articleContent }]);
            }
            setArticleTitle(response.data.parse.title);
            setArticleContent(response.data.parse.text['*']);
        } catch (error) {
            console.error('Error fetching article content:', error);
        }
    };

    return (
        <div className="App">
            <h1>Wikipedia Search Engine</h1>
<p style={{ color: 'red', fontWeight: 'bold' }}>Tunggu 5 menit agar server jalan</p>
            <form onSubmit={handleSearch}>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search Wikipedia"
                />
                <button type="submit">Search</button>
            </form>

            <div className="results-container">
                {searchAttempted && results.length > 0 ? (
                    results.map((result) => (
                        <button key={result.pageid} onClick={() => handleResultClick(result.pageid)} className="result-item">
                            <h3>{result.title}</h3>
                            <p>{parse(result.snippet)}</p>
                        </button>
                    ))
                ) : (
                    searchAttempted && <p>No results found.</p>
                )}
            </div>

            {articleContent && (
                <>
                    <div className="article-container">
                    <button onClick={handleBack} disabled={previousArticles.length === 0}>Back</button>
                        <h2 className="article-title">{articleTitle}</h2>
                        <div className="article-content">
                            {renderContent(articleContent)}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;
