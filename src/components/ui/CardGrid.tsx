// src/components/ui/CardGrid.tsx
"use client";

import { Fragment, useState, useEffect, useRef, useCallback } from "react";
import { MoreVertical, X } from "lucide-react";
import { createPortal } from "react-dom";

export interface RowAction<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (item: T) => void;
  separator?: boolean;
  disabled?: boolean;
  variant?: "default" | "danger" | "primary";
}

export interface CardRenderProps<T> {
  item: T;
  onTitleClick: (item: T) => void;
}

interface CardGridProps<T> {
  data: T[];
  renderCardHeader: (props: CardRenderProps<T>) => React.ReactNode;
  renderCardBody: (props: CardRenderProps<T>) => React.ReactNode;
  renderCardFooter?: (props: CardRenderProps<T>) => React.ReactNode;
  getCardId: (item: T) => string | number;
  rowActions?: ((item: T) => RowAction<T>[]) | RowAction<T>[];
  emptyMessage?: string;
  emptySubMessage?: string;
  loading?: boolean;
  loadingSkeletons?: number;
  cardClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  compact?: boolean;
  onCardClick?: (item: T) => void;
  maxHeight?: string | number;
  containerClassName?: string;
}

export default function CardGrid<T>({
  data,
  renderCardHeader,
  renderCardBody,
  renderCardFooter,
  getCardId,
  rowActions,
  emptyMessage = "No items found",
  emptySubMessage = "Try adjusting your filters",
  loading = false,
  loadingSkeletons = 3,
  cardClassName = "",
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  compact = false,
  onCardClick,
  maxHeight = "calc(100vh - 200px)",
  containerClassName = "",
}: CardGridProps<T>) {
  const [openActionId, setOpenActionId] = useState<string | number | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const actionButtonRef = useRef<HTMLButtonElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  // ✅ Track touch position to distinguish taps from scrolls
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openActionId) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isInsideTrigger = target.closest(`[data-card-actions="${openActionId}"]`);
      const isInsideMenu = target.closest(`[data-dropdown-menu="${openActionId}"]`);
      
      if (!isInsideTrigger && !isInsideMenu) {
        setOpenActionId(null);
        setDropdownPos(null);
      }
    };
    
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openActionId]);

  // Close dropdown on scroll/resize
  useEffect(() => {
    if (openActionId === null) return;
    
    const close = () => {
      setOpenActionId(null);
      setDropdownPos(null);
    };
    
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [openActionId]);

  // Close dropdown on touch outside (mobile)
  useEffect(() => {
    if (!openActionId) return;
    
    const handleTouchOutside = (event: TouchEvent) => {
      const target = event.target as HTMLElement;
      const isInsideTrigger = target.closest(`[data-card-actions="${openActionId}"]`);
      const isInsideMenu = target.closest(`[data-dropdown-menu="${openActionId}"]`);
      
      if (!isInsideTrigger && !isInsideMenu) {
        setOpenActionId(null);
        setDropdownPos(null);
      }
    };
    
    document.addEventListener("touchstart", handleTouchOutside, { passive: true });
    return () => document.removeEventListener("touchstart", handleTouchOutside);
  }, [openActionId]);

  const calculateDropdownPosition = useCallback((buttonRect: DOMRect): { top: number; right: number } => {
    const actions = data.find((d) => getCardId(d) === openActionId);
    if (!actions) return { top: 0, right: 0 };
    
    const actList = typeof rowActions === "function" ? rowActions(actions) : rowActions || [];
    const separators = actList.filter((a) => a.separator).length;
    const estHeight = actList.length * 41 + separators * 9 + 8;
    
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;
    
    let top: number;
    let right: number;
    
    // Try to position below first
    if (spaceBelow >= estHeight + 12) {
      top = buttonRect.bottom + 8;
    } else if (spaceAbove >= estHeight + 12) {
      top = buttonRect.top - estHeight - 8;
    } else {
      // Center vertically if neither fits
      top = Math.max(8, (window.innerHeight - estHeight) / 2);
    }
    
    // Position to the right edge with safety margin
    const dropdownWidth = 224; // w-56 = 14rem = 224px
    right = Math.max(8, window.innerWidth - buttonRect.right);
    
    // Ensure dropdown doesn't go off left edge
    const leftPosition = window.innerWidth - right - dropdownWidth;
    if (leftPosition < 8) {
      right = window.innerWidth - 8 - dropdownWidth;
    }
    
    return { top, right };
  }, [data, getCardId, openActionId, rowActions]);

  const handleToggleActions = useCallback((e: React.MouseEvent | React.TouchEvent, item: T) => {
    e.stopPropagation();
    e.preventDefault();
    
    const id = getCardId(item);
    
    if (openActionId === id) {
      setOpenActionId(null);
      setDropdownPos(null);
      return;
    }

    // On mobile, we don't need to calculate position - just open the bottom sheet
    if (isMobile) {
      setOpenActionId(id);
      setDropdownPos(null);
      return;
    }

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const position = calculateDropdownPosition(rect);
    
    setOpenActionId(id);
    setDropdownPos(position);
  }, [getCardId, openActionId, calculateDropdownPosition, isMobile]);

  const handleCardClick = useCallback((item: T) => {
    if (onCardClick) {
      onCardClick(item);
    }
  }, [onCardClick]);

  const renderSkeletons = () => {
    const count = loadingSkeletons > 0 ? loadingSkeletons : 3;
    return (
      <div className="space-y-3 p-4">
        {[...Array(count)].map((_, i) => (
          <div 
            key={i} 
            className={`p-4 rounded-xl bg-[var(--color-surface-hover)]/40 border border-[var(--color-surface-border)] animate-pulse ${
              compact ? 'p-3' : 'p-4'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] border border-[var(--color-surface-border)] flex-shrink-0" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-4 bg-[var(--color-surface-hover)] rounded w-3/4" />
                  <div className="h-3 bg-[var(--color-surface-hover)] rounded w-1/2" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-hover)] flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="flex items-center justify-center h-full min-h-[200px] p-12 text-center">
      <div>
        <div className="w-16 h-16 rounded-2xl bg-[var(--color-surface-hover)] border border-[var(--color-surface-border)] flex items-center justify-center mx-auto mb-4">
          <MoreVertical size={24} className="text-[var(--color-ink-subtle)]" />
        </div>
        <h3 className="text-base font-bold text-[var(--color-ink)] mb-2">{emptyMessage}</h3>
        {emptySubMessage && (
          <p className="text-sm text-[var(--color-ink-muted)]">{emptySubMessage}</p>
        )}
      </div>
    </div>
  );

  // Render action items
  const renderActionItems = (item: T, isMobileView: boolean = false) => {
    const actions = typeof rowActions === "function" ? rowActions(item) : rowActions || [];
    
    return actions.map((action, index) => (
      <Fragment key={`${action.label}-${index}`}>
        {action.separator && index > 0 && (
          <div className="h-px bg-[var(--color-surface-border)] my-1" role="separator" />
        )}
        <button
          type="button"
          onClick={() => {
            setOpenActionId(null);
            setDropdownPos(null);
            
            if (typeof action.onClick === "function") {
              action.onClick(item);
            }
          }}
          disabled={action.disabled}
          className={`
            w-full flex items-center gap-3 px-4 py-3.5 text-sm font-medium rounded-xl transition-colors
            touch-manipulation min-h-[48px]
            ${action.disabled
              ? "text-[var(--color-ink-subtle)] cursor-not-allowed"
              : action.variant === "danger"
              ? "text-[var(--color-danger-text)] hover:bg-[var(--color-danger-bg)] active:bg-[var(--color-danger-bg)]/80"
              : action.variant === "primary"
              ? "text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 active:bg-[var(--color-primary)]/20"
              : "text-[var(--color-ink)] hover:bg-[var(--color-surface-hover)] active:bg-[var(--color-surface-hover)]/80"
            }
          `}
          role="menuitem"
          aria-disabled={action.disabled}
        >
          {action.icon && <action.icon size={isMobileView ? 20 : 16} className="flex-shrink-0" />}
          <span className="truncate">{action.label}</span>
        </button>
      </Fragment>
    ));
  };

  if (loading) {
    return renderSkeletons();
  }

  return (
    <>
      <div 
        className={`
          overflow-y-auto overflow-x-hidden 
          scroll-smooth 
          ${containerClassName}
        `}
        style={{ 
          maxHeight: typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight,
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className={`space-y-3 ${compact ? 'p-2' : 'p-4'} ${data.length === 0 ? 'h-full' : ''}`}>
          {data.length === 0 ? (
            renderEmptyState()
          ) : (
            data.map((item) => {
              const id = getCardId(item);
              const actions = rowActions && (typeof rowActions === "function" ? rowActions(item) : rowActions);
              const hasActions = actions && actions.length > 0;

              return (
                <div
                  key={id}
                  className={`
                    rounded-xl bg-[var(--color-surface-hover)]/40 
                    border border-[var(--color-surface-border)] 
                    hover:border-[var(--color-primary)]/30 
                    transition-all shadow-sm
                    ${onCardClick ? 'cursor-pointer hover:shadow-md' : ''}
                    ${compact ? 'p-3' : 'p-4'}
                    ${cardClassName}
                  `}
                  onClick={() => handleCardClick(item)}
                  role={onCardClick ? 'button' : undefined}
                  tabIndex={onCardClick ? 0 : undefined}
                  onKeyDown={onCardClick ? (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(item);
                    }
                  } : undefined}
                >
                  <div className={`flex items-start justify-between gap-3 ${headerClassName}`}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="min-w-0 flex-1">
                        {renderCardHeader({
                          item,
                          onTitleClick: () => {},
                        })}
                      </div>
                    </div>

                    {hasActions && (
                      <div className="relative flex-shrink-0" data-card-actions={id}>
                        <button
                          ref={actionButtonRef}
                          type="button"
                          onClick={(e) => handleToggleActions(e, item)}
                          onTouchStart={(e) => {
                            // ✅ Track touch start position to detect scroll vs tap
                            if (e.touches.length === 1) {
                              touchStartPos.current = {
                                x: e.touches[0].clientX,
                                y: e.touches[0].clientY,
                              };
                            }
                          }}
                          onTouchEnd={(e) => {
                            // ✅ Only fire action if touch didn't move significantly (i.e., it was a tap, not a scroll)
                            if (touchStartPos.current && e.changedTouches.length === 1) {
                              const dx = Math.abs(e.changedTouches[0].clientX - touchStartPos.current.x);
                              const dy = Math.abs(e.changedTouches[0].clientY - touchStartPos.current.y);
                              
                              // If movement < 10px, it's a tap — fire the action
                              if (dx < 10 && dy < 10) {
                                if (e.cancelable) {
                                  e.preventDefault();
                                }
                                handleToggleActions(e, item);
                              }
                            }
                            touchStartPos.current = null;
                          }}
                          className={`
                            w-8 h-8 flex items-center justify-center rounded-lg 
                            text-[var(--color-ink-muted)] hover:bg-[var(--color-surface)] 
                            transition-all hover:text-[var(--color-ink)] 
                            active:scale-95 touch-manipulation
                          `}
                          title="More actions"
                          aria-label="More actions"
                          aria-expanded={openActionId === id}
                          aria-haspopup="true"
                        >
                          <MoreVertical size={compact ? 16 : 18} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={`mt-3 ${bodyClassName}`}>
                    {renderCardBody({
                      item,
                      onTitleClick: () => {},
                    })}
                  </div>

                  {renderCardFooter && (
                    <div className={`mt-3 pt-3 border-t border-[var(--color-surface-border)] ${footerClassName}`}>
                      {renderCardFooter({
                        item,
                        onTitleClick: () => {},
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Portal-rendered Action Menu - Bottom Sheet on Mobile, Dropdown on Desktop */}
      {mounted && openActionId !== null && (() => {
        const item = data.find((d) => getCardId(d) === openActionId);
        if (!item) return null;
        
        const actions = typeof rowActions === "function" ? rowActions(item) : rowActions || [];
        if (actions.length === 0) return null;
        
        // Mobile: Bottom Sheet (similar to BottomNav's "More" drawer)
        if (isMobile) {
          return createPortal(
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  setOpenActionId(null);
                  setDropdownPos(null);
                }}
                onTouchStart={() => {
                  setOpenActionId(null);
                  setDropdownPos(null);
                }}
              />
              
              {/* Bottom Sheet */}
              <div
                className="fixed bottom-0 left-0 right-0 z-[9999] bg-[var(--color-surface)] rounded-t-2xl border-t border-[var(--color-surface-border)] pb-[env(safe-area-inset-bottom,16px)] animate-in slide-in-from-bottom duration-300"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                role="dialog"
                aria-label="Action menu"
              >
                {/* Handle bar */}
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-12 h-1 rounded-full bg-[var(--color-surface-border)]" />
                </div>
                
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-surface-border)]">
                  <span className="text-sm font-semibold text-[var(--color-ink)]">Actions</span>
                  <button
                    onClick={() => {
                      setOpenActionId(null);
                      setDropdownPos(null);
                    }}
                    className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] transition-colors"
                    aria-label="Close"
                  >
                    <X size={18} className="text-[var(--color-ink-muted)]" />
                  </button>
                </div>
                
                {/* Actions List */}
                <div className="p-2 max-h-[50vh] overflow-y-auto">
                  {renderActionItems(item, true)}
                </div>
              </div>
            </>,
            document.body
          );
        }
        
        // Desktop: Dropdown Menu
        if (dropdownPos) {
          return createPortal(
            <>
              {/* Backdrop */}
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => {
                  setOpenActionId(null);
                  setDropdownPos(null);
                }}
                onTouchStart={() => {
                  setOpenActionId(null);
                  setDropdownPos(null);
                }}
              />
              
              {/* Dropdown Menu */}
              <div
                ref={dropdownRef}
                data-dropdown-menu={openActionId}
                className="fixed z-[9999] min-w-[180px] max-w-[280px] bg-[var(--color-surface)] border border-[var(--color-surface-border)] rounded-xl shadow-[var(--shadow-dropdown)] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                style={{ 
                  top: dropdownPos.top, 
                  right: dropdownPos.right,
                  maxHeight: '60vh',
                  overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                role="menu"
                aria-label="Action menu"
              >
                {renderActionItems(item, false)}
              </div>
            </>,
            document.body
          );
        }
        
        return null;
      })()}
    </>
  );
}
