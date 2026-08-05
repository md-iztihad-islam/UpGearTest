import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { debounce } from "lodash";
import searchProductsApi from "@/services/clientPart/search/searchProductsApi";

const SearchInput = ({ placeholder = "Search for products...", className = "", autoFocus = false }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    
    const searchRef = useRef(null);
    const dropdownRef = useRef(null);

    // Load recent searches
    useEffect(() => {
        const savedSearches = localStorage.getItem("recentSearches");
        if (savedSearches) {
            setRecentSearches(JSON.parse(savedSearches));
        }
    }, []);

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounced search
    const debouncedSearch = useCallback(
        debounce(async (query) => {
            if (!query.trim() || query.length < 2) {
                setSearchResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            try {
                const response = await searchProductsApi({ query, limit: 8 });
                setSearchResults(response.data?.products || []);
            } catch (error) {
                console.error("Search error:", error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        []
    );

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setShowDropdown(true);
        setHighlightedIndex(-1);
        
        if (value.trim().length >= 2) {
            debouncedSearch(value);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const saveRecentSearch = (query) => {
        if (!query.trim()) return;
        
        const updatedSearches = [
            query,
            ...recentSearches.filter(s => s !== query).slice(0, 4)
        ];
        
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    };

    const handleSearchSubmit = (query = searchQuery) => {
        if (query.trim()) {
            saveRecentSearch(query);
            navigate(`/search?q=${encodeURIComponent(query)}`);
            setSearchQuery("");
            setShowDropdown(false);
            setSearchResults([]);
        }
    };

    const navigateToProduct = (product) => {
        navigate(`/products/${product._id}`);
        saveRecentSearch(product.title);
        setSearchQuery("");
        setShowDropdown(false);
        setSearchResults([]);
    };

    const handleKeyDown = (e) => {
        if (!showDropdown) return;

        const items = searchResults.length > 0 ? searchResults : recentSearches;
        
        switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            setHighlightedIndex(prev => 
                prev < items.length - 1 ? prev + 1 : prev
            );
            break;
        case 'ArrowUp':
            e.preventDefault();
            setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
            break;
        case 'Enter':
            e.preventDefault();
            if (highlightedIndex >= 0 && searchResults[highlightedIndex]) {
                navigateToProduct(searchResults[highlightedIndex]);
            } else if (highlightedIndex >= 0 && recentSearches[highlightedIndex]) {
                handleSearchSubmit(recentSearches[highlightedIndex]);
            } else {
                handleSearchSubmit();
            }
            break;
        case 'Escape':
            setShowDropdown(false);
            setHighlightedIndex(-1);
            break;
        }
    };

    const formatPrice = (price) => {
        return `৳${price.toLocaleString('en-BD')}`;
    };

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setShowDropdown(false);
    };

    const removeRecentSearch = (searchToRemove, e) => {
        e.stopPropagation();
        const updatedSearches = recentSearches.filter(s => s !== searchToRemove);
        setRecentSearches(updatedSearches);
        localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
    };

    return (
        <div ref={searchRef} className={`relative ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-2.5 sm:left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 z-10" />
                <Input
                    type="text"
                    placeholder={placeholder}
                    className="pl-8 sm:pl-10 pr-8 sm:pr-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all h-9 sm:h-10 text-sm sm:text-base"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setShowDropdown(true)}
                    autoFocus={autoFocus}
                    autoComplete="off"
                />
                {searchQuery && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10"
                    >
                        <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                )}
            </div>

            {/* Dropdown Results - Responsive */}
            {showDropdown && (
                <div 
                    ref={dropdownRef}
                    className="fixed sm:absolute left-0 right-0 sm:left-auto sm:right-auto top-[52px] sm:top-full sm:mt-2 bg-gray-900 border-t sm:border border-gray-700 sm:rounded-lg shadow-2xl shadow-black/50 max-h-[calc(100vh-60px)] sm:max-h-[500px] overflow-hidden z-50 sm:min-w-[400px] lg:min-w-[500px]"
                >
                    {/* Loading State */}
                    {isSearching && (
                        <div className="p-6 sm:p-8 text-center">
                            <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto text-gray-400" />
                            <p className="text-xs sm:text-sm text-gray-400 mt-2">Searching...</p>
                        </div>
                    )}

                    {/* Search Results */}
                    {!isSearching && searchResults.length > 0 && (
                        <div className="overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[450px]">
                        <div className="p-2 sm:p-3 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                                Products ({searchResults.length})
                            </p>
                        </div>
                        {searchResults.map((product, index) => (
                            <button
                                key={product._id}
                                onClick={() => navigateToProduct(product)}
                                className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-3 hover:bg-gray-800/70 active:bg-gray-800 transition-colors border-b border-gray-800/50 last:border-0 ${
                                    index === highlightedIndex ? 'bg-gray-800' : ''
                                }`}
                            >
                            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 rounded-md border border-gray-700 flex-shrink-0">
                                <AvatarImage 
                                    src={product.bannerImage || product.images?.[0]} 
                                    alt={product.title}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-gray-800 text-gray-400 rounded-md text-sm">
                                    {product.title?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-xs sm:text-sm font-medium text-white truncate leading-tight">
                                    {product.title}
                                </p>
                                    {product.subTitle && (
                                <p className="text-xs text-gray-400 truncate mt-0.5 leading-tight">
                                    {product.subTitle}
                                </p>
                        )}
                                <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                                <span className="text-xs sm:text-sm font-semibold text-white">
                                    {formatPrice(product.finalPrice || product.mainPrice)}
                                </span>
                                {product.discountAmount > 0 && (
                                    <>
                                    <span className="text-xs text-gray-500 line-through">
                                        {formatPrice(product.mainPrice)}
                                    </span>
                                    <Badge className="text-xs px-1 py-0 h-4 sm:h-5 bg-red-600 text-white border-0">
                                        -{Math.round((product.discountAmount / product.mainPrice) * 100)}%
                                    </Badge>
                                    </>
                                )}
                                </div>
                            </div>
                            
                            <ChevronRight className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            </button>
                        ))}
                        
                        {/* View All Results Button */}
                        <div className="p-2 sm:p-3 border-t border-gray-800 bg-gray-900/80 backdrop-blur-sm sticky bottom-0">
                            <button
                                onClick={() => handleSearchSubmit()}
                                className="w-full py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg transition-colors"
                            >
                                View All Results
                            </button>
                        </div>
                        </div>
                    )}

                    {/* No Results */}
                    {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                        <div className="p-6 sm:p-8 text-center">
                        <Search className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-gray-600 mb-2" />
                        <p className="text-xs sm:text-sm text-gray-400">No products found for "{searchQuery}"</p>
                        <p className="text-xs text-gray-500 mt-1">Try different keywords</p>
                        </div>
                    )}

                    {/* Recent Searches */}
                    {!isSearching && !searchQuery && recentSearches.length > 0 && (
                        <div className="overflow-y-auto max-h-[calc(100vh-120px)] sm:max-h-[450px]">
                        <div className="p-2 sm:p-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/80 backdrop-blur-sm sticky top-0 z-10">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            Recent Searches
                            </p>
                            <button
                            onClick={() => {
                                setRecentSearches([]);
                                localStorage.removeItem("recentSearches");
                            }}
                            className="text-xs text-gray-500 hover:text-white transition-colors"
                            >
                            Clear
                            </button>
                        </div>
                        {recentSearches.map((search, index) => (
                            <button
                            key={index}
                            onClick={() => handleSearchSubmit(search)}
                            className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-800/70 active:bg-gray-800 transition-colors border-b border-gray-800/50 last:border-0 group ${
                                index === highlightedIndex ? 'bg-gray-800' : ''
                            }`}
                            >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
                                <span className="text-xs sm:text-sm text-gray-300 truncate">{search}</span>
                            </div>
                            <button
                                onClick={(e) => removeRecentSearch(search, e)}
                                className="p-1 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            >
                                <X className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                            </button>
                        ))}
                        </div>
                    )}

                    {/* Popular Searches (Empty State) */}
                    {!isSearching && !searchQuery && recentSearches.length === 0 && (
                        <div className="p-3 sm:p-4">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2 sm:mb-3">
                            Popular Searches
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                            {["Keyboard", "Mouse", "Headphones", "Monitor", "Laptop", "Gaming"].map((term) => (
                            <button
                                key={term}
                                onClick={() => {
                                setSearchQuery(term);
                                debouncedSearch(term);
                                }}
                                className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white active:bg-gray-600 transition-colors"
                            >
                                {term}
                            </button>
                            ))}
                        </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchInput;