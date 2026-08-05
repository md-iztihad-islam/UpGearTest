import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import getFiltersBySubCategoryApi from "@/services/dashboard/category/getFiltersBySubCategoryApi";
import getFilterItemsBySubCategoryApi from "@/services/dashboard/category/getFilterItemsBySubCategoryApi";
import { Filter, X, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

function ProductBySubcategoryFilters({ filters, setFilters, subcategoryId }) {
    const [localPriceRange, setLocalPriceRange] = useState(filters.priceRange);
    // Fetch filters for the subcategory
    const { data: filterData } = useQuery({
        queryKey: ['filters-by-subcategory', subcategoryId],
        queryFn: () => getFiltersBySubCategoryApi(subcategoryId),
        enabled: !!subcategoryId,
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    });

    // Fetch filter items based on subcategory
    const { data: filterItemData } = useQuery({
        queryKey: ['filter-items-by-filters', subcategoryId],
        queryFn: () => getFilterItemsBySubCategoryApi(subcategoryId),
        enabled: !!subcategoryId,
        cacheTime: 5 * 60 * 1000,
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        setLocalPriceRange(filters.priceRange);
    }, [filters.priceRange]);

    const handlePriceChange = (value) => {
        setLocalPriceRange([value[0], value[1]]);
    };

    // Function to handle changes for any filter type
    const handleFilterChange = (filterId, itemId, checked) => {
        setFilters((prev) => {
            const updatedFilterValues = checked
                ? [...(prev[filterId] || []), itemId]
                : (prev[filterId] || []).filter((id) => id !== itemId);

            return {
                ...prev,
                [filterId]: updatedFilterValues,
            };
        });
    };

    // Handle price range change
    const handlePriceCommit = (value) => {
        setFilters((prev) => ({
            ...prev,
            priceRange: [value[0], value[1]],
        }));
    };

    // Reset all filters
    const clearAllFilters = () => {
        const filterIds = filterData?.data?.map(filter => filter._id) || [];
        const filterReset = filterIds.reduce((acc, filterId) => {
            acc[filterId] = [];
            return acc;
        }, {});
        
        setFilters({
            priceRange: [0, 30000],
            ...filterReset
        });
    };

    const getActiveFilterCount = () => {
        let count = 0;
        Object.keys(filters).forEach((key) => {
            if (key === "priceRange") {
                if (filters[key][0] > 0 || filters[key][1] < 30000) {
                    count += 1;
                }
            } else {
                const value = filters[key];
                if (Array.isArray(value)) {
                    count += value.length;
                }
            }
        });
        return count;
    };

    const activeFilterCount = getActiveFilterCount();
    const hasActiveFilters = activeFilterCount > 0;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-700/50">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <Filter className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">Filters</h2>
                        {hasActiveFilters && (
                            <p className="text-xs text-gray-400">
                                {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                            </p>
                        )}
                    </div>
                </div>
                {hasActiveFilters && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-3"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {Object.keys(filters).map((key) => {
                        const value = filters[key];
                        if (key === "priceRange" && (value[0] > 0 || value[1] < 30000)) {
                            return (
                                <Badge
                                    key={key}
                                    variant="secondary"
                                    className="bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 cursor-pointer"
                                    onClick={() => setFilters(prev => ({ ...prev, priceRange: [0, 30000] }))}
                                >
                                    ৳{value[0]} - ৳{value[1]}
                                    <X className="h-3 w-3 ml-1" />
                                </Badge>
                            );
                        }
                        return null;
                    })}
                </div>
            )}

            {/* Filters Accordion */}
            <Accordion
                type="multiple"
                defaultValue={filterData?.data?.map(f => f._id) || []}
                className="space-y-3"
            >
                {/* Dynamic Filters */}
                {filterData?.data?.map((filter) => {
                    const itemsForFilter = filterItemData?.data?.filter((item) => item.filter._id === filter._id) || [];
                    const selectedCount = (filters[filter._id] || []).length;
                    
                    return (
                        <AccordionItem 
                            key={filter._id} 
                            value={filter._id}
                            className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 overflow-hidden"
                        >
                            <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                                <div className="flex items-center justify-between w-full pr-3">
                                    <span className="text-gray-200">{filter.title}</span>
                                    {selectedCount > 0 && (
                                        <Badge 
                                            variant="secondary" 
                                            className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs h-5 px-2"
                                        >
                                            {selectedCount}
                                        </Badge>
                                    )}
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pb-4">
                                <div className="space-y-3 mt-2">
                                    {itemsForFilter.map((item) => {
                                        const isChecked = filters[filter._id]?.includes(item._id);
                                        return (
                                            <div 
                                                key={item._id} 
                                                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                                                    isChecked ? 'bg-blue-500/10' : 'hover:bg-gray-700/30'
                                                }`}
                                            >
                                                <Checkbox
                                                    id={item._id}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) =>
                                                        handleFilterChange(filter._id, item._id, checked)
                                                    }
                                                    className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                                />
                                                <Label 
                                                    htmlFor={item._id} 
                                                    className={`flex-1 cursor-pointer text-sm ${
                                                        isChecked ? 'text-white font-medium' : 'text-gray-400'
                                                    }`}
                                                >
                                                    {item.title}
                                                </Label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}

                {/* Price Range Filter */}
                <AccordionItem 
                    value="price" 
                    className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl px-4 overflow-hidden"
                >
                    <AccordionTrigger className="text-sm font-medium py-3 hover:no-underline">
                        <div className="flex items-center justify-between w-full pr-3">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-200">Price Range</span>
                            </div>
                            {(filters.priceRange[0] > 0 || filters.priceRange[1] < 30000) && (
                                <Badge 
                                    variant="secondary" 
                                    className="bg-green-500/20 text-green-400 border-green-500/30 text-xs h-5 px-2"
                                >
                                    Active
                                </Badge>
                            )}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-6">
                        <div className="space-y-4 mt-4">
                            <Slider
                                value={[localPriceRange[0], localPriceRange[1]]}
                                onValueChange={handlePriceChange}       // updates local state only (no API call)
                                onValueCommit={handlePriceCommit}       // updates filters state (triggers API call)
                                min={0}
                                max={30000}
                                step={500}
                                className="mt-2"
                            />
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">Min Price</p>
                                    <p className="text-base font-bold text-white">৳{filters.priceRange[0].toLocaleString()}</p>
                                </div>
                                <div className="text-gray-600">—</div>
                                <div className="flex-1 bg-gray-900/50 border border-gray-700/50 rounded-lg p-3">
                                    <p className="text-xs text-gray-400 mb-1">Max Price</p>
                                    <p className="text-base font-bold text-white">৳{filters.priceRange[1].toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Apply Filters Button - Mobile Only */}
            {hasActiveFilters && (
                <div className="lg:hidden pt-4 border-t border-gray-700/50">
                    <Button 
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 font-semibold"
                        size="lg"
                    >
                        Apply {activeFilterCount} {activeFilterCount === 1 ? 'Filter' : 'Filters'}
                    </Button>
                </div>
            )}
        </div>
    );
}

export default ProductBySubcategoryFilters;