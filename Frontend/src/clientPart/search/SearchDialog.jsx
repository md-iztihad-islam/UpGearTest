import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Package, ChevronRight, Loader2, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { debounce } from "lodash";
import searchProductsApi from "@/services/clientPart/search/searchProductsApi";

const SearchDialog = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Load recent searches
  useEffect(() => {
    const savedSearches = localStorage.getItem("recentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (query) => {
    if (!query.trim()) return;
    
    const updatedSearches = [
      query,
      ...recentSearches.filter(s => s !== query).slice(0, 4)
    ];
    
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim() || query.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await searchProductsApi({ query, limit: 10 });
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

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      handleClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const removeRecentSearch = (searchToRemove) => {
    const updatedSearches = recentSearches.filter(s => s !== searchToRemove);
    setRecentSearches(updatedSearches);
    localStorage.setItem("recentSearches", JSON.stringify(updatedSearches));
  };

  const navigateToProduct = (product) => {
    navigate(`/products/${product._id}`);
    saveRecentSearch(product.title);
    handleClose();
  };

  const formatPrice = (price) => {
    return `৳${price.toLocaleString('en-BD')}`;
  };

  const handleClose = () => {
    setSearchQuery("");
    setSearchResults([]);
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      handleClose();
    } else {
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 bg-black border-gray-800 max-h-[85vh] flex flex-col">
        <DialogHeader className="p-4 sm:p-6 border-b border-gray-800">
          <DialogTitle className="text-white flex items-center gap-2 text-lg sm:text-xl">
            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            Search Products
          </DialogTitle>
        </DialogHeader>
        
        {/* Search Input */}
        <div className="p-4 sm:p-6 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search for products, brands, categories..."
              className="pl-11 pr-12 h-12 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-gray-600 text-base"
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {/* Loading */}
          {isSearching && (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-400">Searching products...</p>
            </div>
          )}

          {/* Search Results */}
          {!isSearching && searchResults.length > 0 && (
            <div>
              <div className="px-4 sm:px-6 py-3 border-b border-gray-800">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                  Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="p-2 sm:p-4">
                {searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => navigateToProduct(product)}
                    className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-800/50 transition-colors rounded-lg text-left"
                  >
                    <Avatar className="h-14 w-14 sm:h-16 sm:w-16 rounded-lg border border-gray-700 flex-shrink-0">
                      <AvatarImage 
                        src={product.bannerImage || product.images?.[0]} 
                        alt={product.title}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-gray-800 text-gray-400 rounded-lg text-lg">
                        {product.title?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-white truncate">
                        {product.title}
                      </p>
                      {product.subTitle && (
                        <p className="text-xs sm:text-sm text-gray-400 truncate mt-0.5">
                          {product.subTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-sm sm:text-base font-semibold text-white">
                          {formatPrice(product.finalPrice || product.mainPrice)}
                        </span>
                        {product.discountAmount > 0 && (
                          <>
                            <span className="text-xs text-gray-500 line-through">
                              {formatPrice(product.mainPrice)}
                            </span>
                            <Badge className="text-xs px-1.5 py-0 h-5 bg-red-600 text-white border-0">
                              {Math.round((product.discountAmount / product.mainPrice) * 100)}% OFF
                            </Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
            <div className="p-8 sm:p-12 text-center">
              <Package className="h-12 w-12 sm:h-16 sm:w-16 text-gray-600 mx-auto mb-3" />
              <p className="text-base sm:text-lg text-gray-400 mb-1">No products found</p>
              <p className="text-sm text-gray-500">Try different keywords or browse categories</p>
            </div>
          )}

          {/* Recent Searches */}
          {!isSearching && !searchQuery && recentSearches.length > 0 && (
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Recent Searches</h3>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-gray-500 hover:text-white transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <button
                      onClick={() => {
                        setSearchQuery(search);
                        debouncedSearch(search);
                      }}
                      className="flex-1 text-left px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-800/50 transition-colors flex items-center gap-3"
                    >
                      <TrendingUp className="h-4 w-4 text-gray-500" />
                      {search}
                    </button>
                    <button
                      onClick={() => removeRecentSearch(search)}
                      className="p-2 text-gray-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {!searchQuery && recentSearches.length === 0 && !isSearching && (
            <div className="p-4 sm:p-6">
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-4">Popular Searches</h3>
              <div className="flex flex-wrap gap-2">
                {["Keyboard", "Mouse", "Headphones", "Monitor", "Laptop", "Gaming"].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      setSearchQuery(term);
                      debouncedSearch(term);
                    }}
                    className="px-4 py-2 text-sm font-medium rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-gray-800">
          <div className="flex items-center justify-between gap-3">
            <Button
              onClick={handleSearchSubmit}
              disabled={!searchQuery.trim()}
              className="flex-1 h-10 sm:h-11 bg-white text-black hover:bg-gray-200 disabled:opacity-50"
            >
              View All Results
            </Button>
            <span className="text-xs text-gray-400 hidden sm:inline">
              Press Enter ↵
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;