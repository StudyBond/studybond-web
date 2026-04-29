"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils/cn";
import { X, Calculator } from "lucide-react";

/**
 * JAMB/POST UTME CBT-Standard On-Screen Calculator
 *
 * Matches the real JAMB calculator: basic arithmetic only.
 * - Numeric keys: 0–9
 * - Operators: + − × ÷
 * - Square root (√)
 * - Decimal point
 * - C (clear all), CE (clear entry / delete last digit)
 * - Equals (=)
 * - Draggable on desktop, bottom-sheet on mobile
 * - Persists state between questions
 */

type ExamCalculatorProps = {
  onClose: () => void;
};

export function ExamCalculator({ onClose }: ExamCalculatorProps) {
  const [display, setDisplay] = useState("0");
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // ─── Dragging state (desktop only) ───
  const [position, setPosition] = useState({ x: -1, y: -1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const calcRef = useRef<HTMLDivElement>(null);

  // Initialize position to center-right on first render
  useEffect(() => {
    if (position.x === -1 && typeof window !== "undefined") {
      setPosition({
        x: Math.max(20, window.innerWidth - 340),
        y: Math.max(80, Math.floor(window.innerHeight * 0.15)),
      });
    }
  }, [position.x]);

  // ─── Drag handlers ───
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (window.innerWidth < 768) return; // No dragging on mobile
    setIsDragging(true);
    const rect = calcRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  }, []);

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e: MouseEvent) {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - 280, e.clientX - dragOffset.current.x)),
        y: Math.max(0, Math.min(window.innerHeight - 100, e.clientY - dragOffset.current.y)),
      });
    }

    function handleMouseUp() {
      setIsDragging(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // ─── Calculator logic ───
  const inputDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      // Max 12 digits
      if (display.replace(/[^0-9]/g, "").length >= 12) return;
      setDisplay(display === "0" ? digit : display + digit);
    }
  }, [display, waitingForOperand]);

  const inputDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  }, [display, waitingForOperand]);

  const clearAll = useCallback(() => {
    setDisplay("0");
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  }, []);

  const clearEntry = useCallback(() => {
    if (display.length <= 1 || display === "0") {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display]);

  const performCalculation = useCallback((left: number, right: number, op: string): number => {
    switch (op) {
      case "+": return left + right;
      case "-": return left - right;
      case "×": return left * right;
      case "÷": return right !== 0 ? left / right : NaN;
      default: return right;
    }
  }, []);

  const handleOperator = useCallback((nextOp: string) => {
    const current = parseFloat(display);

    if (previousValue !== null && operator && !waitingForOperand) {
      const result = performCalculation(previousValue, current, operator);
      const resultStr = isNaN(result) || !isFinite(result) ? "Error" : formatDisplay(result);
      setDisplay(resultStr);
      setPreviousValue(isNaN(result) || !isFinite(result) ? null : result);
    } else {
      setPreviousValue(current);
    }

    setOperator(nextOp);
    setWaitingForOperand(true);
  }, [display, previousValue, operator, waitingForOperand, performCalculation]);

  const handleEquals = useCallback(() => {
    if (previousValue === null || operator === null) return;

    const current = parseFloat(display);
    const result = performCalculation(previousValue, current, operator);
    const resultStr = isNaN(result) || !isFinite(result) ? "Error" : formatDisplay(result);

    setDisplay(resultStr);
    setPreviousValue(null);
    setOperator(null);
    setWaitingForOperand(true);
  }, [display, previousValue, operator, performCalculation]);

  const handleSquareRoot = useCallback(() => {
    const current = parseFloat(display);
    if (current < 0) {
      setDisplay("Error");
      setPreviousValue(null);
      setOperator(null);
      setWaitingForOperand(true);
      return;
    }
    const result = Math.sqrt(current);
    setDisplay(formatDisplay(result));
    setWaitingForOperand(true);
  }, [display]);

  function formatDisplay(value: number): string {
    if (Number.isInteger(value) && Math.abs(value) < 1e12) {
      return value.toString();
    }
    // Limit to 10 significant digits
    const str = value.toPrecision(10);
    // Remove trailing zeros after decimal
    return parseFloat(str).toString();
  }

  // ─── Keyboard support ───
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Only handle when calculator is visible
      if (e.key >= "0" && e.key <= "9") {
        e.stopPropagation();
        inputDigit(e.key);
      } else if (e.key === ".") {
        e.stopPropagation();
        inputDecimal();
      } else if (e.key === "+") {
        e.stopPropagation();
        handleOperator("+");
      } else if (e.key === "-") {
        e.stopPropagation();
        handleOperator("-");
      } else if (e.key === "*") {
        e.stopPropagation();
        handleOperator("×");
      } else if (e.key === "/") {
        e.preventDefault();
        e.stopPropagation();
        handleOperator("÷");
      } else if (e.key === "Enter" || e.key === "=") {
        e.stopPropagation();
        handleEquals();
      } else if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "Backspace") {
        e.stopPropagation();
        clearEntry();
      } else if (e.key === "Delete") {
        e.stopPropagation();
        clearAll();
      }
    }

    window.addEventListener("keydown", handleKeyDown, { capture: true });
    return () => window.removeEventListener("keydown", handleKeyDown, { capture: true });
  }, [inputDigit, inputDecimal, handleOperator, handleEquals, clearEntry, clearAll, onClose]);

  // ─── Button definitions ───
  const buttons = [
    { label: "C", action: clearAll, style: "function" as const },
    { label: "CE", action: clearEntry, style: "function" as const },
    { label: "√", action: handleSquareRoot, style: "function" as const },
    { label: "÷", action: () => handleOperator("÷"), style: "operator" as const },

    { label: "7", action: () => inputDigit("7"), style: "digit" as const },
    { label: "8", action: () => inputDigit("8"), style: "digit" as const },
    { label: "9", action: () => inputDigit("9"), style: "digit" as const },
    { label: "×", action: () => handleOperator("×"), style: "operator" as const },

    { label: "4", action: () => inputDigit("4"), style: "digit" as const },
    { label: "5", action: () => inputDigit("5"), style: "digit" as const },
    { label: "6", action: () => inputDigit("6"), style: "digit" as const },
    { label: "−", action: () => handleOperator("-"), style: "operator" as const },

    { label: "1", action: () => inputDigit("1"), style: "digit" as const },
    { label: "2", action: () => inputDigit("2"), style: "digit" as const },
    { label: "3", action: () => inputDigit("3"), style: "digit" as const },
    { label: "+", action: () => handleOperator("+"), style: "operator" as const },

    { label: "0", action: () => inputDigit("0"), style: "digit" as const, span: 2 },
    { label: ".", action: inputDecimal, style: "digit" as const },
    { label: "=", action: handleEquals, style: "equals" as const },
  ];

  // ─── Render ───
  const calcContent = (
    <div
      ref={calcRef}
      className={cn(
        "w-[280px] rounded-2xl border border-white/[0.08] bg-[#0e0e11]/95 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]",
        "overflow-hidden select-none",
      )}
    >
      {/* Title bar — draggable */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]",
          "md:cursor-grab md:active:cursor-grabbing",
        )}
      >
        <div className="flex items-center gap-2">
          <Calculator className="h-3.5 w-3.5 text-[var(--sb-accent)]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">
            Calculator
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Display */}
      <div className="px-4 py-4 border-b border-white/[0.04]">
        {/* Operator indicator */}
        <div className="h-4 mb-1">
          {operator && previousValue !== null ? (
            <span className="text-[10px] text-white/20 font-mono">
              {formatDisplay(previousValue)} {operator}
            </span>
          ) : null}
        </div>
        {/* Main display */}
        <div className="text-right">
          <span
            className={cn(
              "font-mono font-bold text-white tracking-wide transition-all",
              display.length > 10 ? "text-xl" : display.length > 7 ? "text-2xl" : "text-3xl",
              display === "Error" && "text-red-400",
            )}
          >
            {display}
          </span>
        </div>
      </div>

      {/* Button grid */}
      <div className="grid grid-cols-4 gap-[1px] p-2">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className={cn(
              "flex h-12 items-center justify-center rounded-xl text-base font-semibold transition-all duration-150",
              "active:scale-95 active:brightness-90",
              btn.span === 2 && "col-span-2",
              btn.style === "digit" &&
                "bg-white/[0.04] text-white/80 hover:bg-white/[0.08]",
              btn.style === "operator" &&
                "bg-[var(--sb-accent)]/[0.08] text-[var(--sb-accent)] hover:bg-[var(--sb-accent)]/[0.15] font-bold text-lg",
              btn.style === "function" &&
                "bg-white/[0.02] text-white/50 hover:bg-white/[0.06] text-sm font-bold",
              btn.style === "equals" &&
                "bg-[var(--sb-accent)] text-white hover:brightness-110 shadow-[0_0_20px_var(--sb-accent-glow)] font-bold text-lg",
            )}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: floating draggable */}
      <div
        className="hidden md:block fixed z-[100]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        {calcContent}
      </div>

      {/* Mobile: bottom-sheet overlay */}
      <div className="md:hidden fixed inset-0 z-[100] flex items-end justify-center pointer-events-none">
        <div
          className="absolute inset-0 bg-black/10 animate-in fade-in duration-200 pointer-events-auto"
          onClick={onClose}
        />
        <div className="relative w-full max-w-sm pb-4 px-4 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
          {calcContent}
        </div>
      </div>
    </>
  );
}
