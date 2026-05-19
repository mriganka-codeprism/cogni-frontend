import React, { useState, useRef } from 'react';
import Editor, { OnMount, loader } from '@monaco-editor/react';
import { Box, Button, Typography, Alert, Select, MenuItem } from '@mui/material';
import * as monaco from 'monaco-editor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Use locally bundled monaco-editor instead of CDN (unpkg.com) to avoid
// blocked/slow CDN in production environments causing a disabled editor.
loader.config({ monaco });

interface Task {
  id: string;
  text: string;
  language: string;
}

interface CodingEditorProps {
  tasks: Task[];
  onSubmit: (code: string, taskId: string) => Promise<void>;
  disabled?: boolean;
  initialCodes?: Record<string, string>;
  timeRemaining?: number | null; // seconds
  title?: string;
  submittedTaskIds?: Set<string>;
}

const LANG_MAP: Record<string, string> = {
  python: 'python',
  sql: 'sql',
  javascript: 'javascript',
  typescript: 'typescript',
  java: 'java',
  cpp: 'cpp',
  csharp: 'csharp',
};

const MAX_CHARS = 50000;

const CodingEditor: React.FC<CodingEditorProps> = ({
  tasks,
  onSubmit,
  disabled = false,
  initialCodes = {},
  timeRemaining = null,
  title = 'Coding Challenge',
  submittedTaskIds = new Set(),
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTask = tasks[activeIndex];
  const isActiveTaskSubmitted = submittedTaskIds.has(activeTask.id);

  const [codeMap, setCodeMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    tasks.forEach((t) => {
      map[t.id] = initialCodes[t.id] || '';
    });
    return map;
  });

  // Per-task language override — initialised from task.language, candidate can change
  const [langMap, setLangMap] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    tasks.forEach((t) => {
      map[t.id] = (t.language || 'python').toLowerCase();
    });
    return map;
  });

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const currentCode = codeMap[activeTask.id] || '';

  const handleEditorDidMount: OnMount = (ed, monaco) => {
    editorRef.current = ed;

    // Disable copy/cut/paste (all modifier combos)
    const showDisabled = (action: string) => {
      setError(`${action} is disabled`);
      setTimeout(() => setError(null), 3000);
    };
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => showDisabled('Copy'));
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => showDisabled('Cut'));
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => showDisabled('Paste'));
    // Ctrl+Shift+V (paste without formatting)
    ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyV, () => showDisabled('Paste'));

    // Block browser-level paste on the editor DOM as a fallback
    ed.getDomNode()?.addEventListener('paste', (e) => {
      e.preventDefault();
      showDisabled('Paste');
    });

    // Re-focus editor when window regains focus (prevents cursor/dimming loss)
    const onWindowFocus = () => ed.focus();
    window.addEventListener('focus', onWindowFocus);
    ed.onDidDispose(() => window.removeEventListener('focus', onWindowFocus));

    ed.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    setCodeMap((prev) => ({ ...prev, [activeTask.id]: value || '' }));
    setError(null);
  };

  const handleSubmit = async () => {
    const code = codeMap[activeTask.id] || '';
    if (!code.trim()) {
      setError('Please write some code before submitting');
      return;
    }
    if (code.length > MAX_CHARS) {
      setError(`Code exceeds maximum length of ${MAX_CHARS} characters`);
      return;
    }
    try {
      setIsSubmitting(true);
      await onSubmit(code, activeTask.id);

      // Auto-advance to next unsubmitted task (the newly submitted one will be
      // in submittedTaskIds on next render, but we can eagerly find the next)
      const nextUnsubmitted = tasks.findIndex(
        (t, idx) => idx !== activeIndex && !submittedTaskIds.has(t.id)
      );
      if (nextUnsubmitted !== -1) {
        setActiveIndex(nextUnsubmitted);
      }
    } catch {
      setError('Error submitting code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const charCount = currentCode.length;
  const langKey = langMap[activeTask.id] || (activeTask.language || 'python').toLowerCase();
  const monacoLang = LANG_MAP[langKey] || langKey;

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${('0' + s).slice(-2)}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: '#1e1e2e',
        color: '#cdd6f4',
        overflow: 'hidden',
        borderRadius: '8px',
        border: '1px solid #313244',
      }}
    >
      {/* ── Top bar: tabs + timer + submit ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
          bgcolor: '#181825',
          borderBottom: '1px solid #313244',
          minHeight: 48,
        }}
      >
        {/* Left: task tabs */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ color: '#a6adc8', mr: 1, fontWeight: 600 }}>
            {title}
          </Typography>
          {tasks.map((t, idx) => (
            <Button
              key={t.id}
              size="small"
              onClick={() => setActiveIndex(idx)}
              disabled={disabled || isSubmitting}
              sx={{
                minWidth: 'auto',
                px: 2,
                py: 0.5,
                fontSize: '0.8rem',
                fontWeight: idx === activeIndex ? 700 : 400,
                color: idx === activeIndex ? '#cdd6f4' : '#6c7086',
                bgcolor: idx === activeIndex ? '#313244' : 'transparent',
                borderRadius: '6px',
                '&:hover': { bgcolor: '#313244' },
                textTransform: 'none',
              }}
            >
              Task {idx + 1}{submittedTaskIds.has(t.id) ? ' ✓' : ''}
            </Button>
          ))}
          <Select
            size="small"
            value={langKey}
            onChange={(e) => {
              setLangMap((prev) => ({ ...prev, [activeTask.id]: e.target.value }));
            }}
            disabled={disabled || isSubmitting || isActiveTaskSubmitted}
            sx={{
              ml: 1,
              height: 24,
              fontSize: '0.75rem',
              fontWeight: 600,
              color: '#a6e3a1',
              bgcolor: '#45475a',
              borderRadius: '6px',
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
              '& .MuiSelect-icon': { color: '#a6e3a1', fontSize: '1rem' },
              '& .MuiSelect-select': { py: '2px', px: 1 },
            }}
            MenuProps={{
              sx: { zIndex: 10001 },
              PaperProps: {
                sx: { bgcolor: '#313244', color: '#cdd6f4', fontSize: '0.8rem' },
              },
            }}
          >
            {Object.keys(LANG_MAP).map((lang) => (
              <MenuItem key={lang} value={lang} sx={{ fontSize: '0.8rem' }}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Right: timer + submit */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {timeRemaining !== null && timeRemaining !== undefined && (
            <Typography
              variant="subtitle2"
              sx={{
                color: timeRemaining < 60 ? '#f38ba8' : timeRemaining < 300 ? '#fab387' : '#a6e3a1',
                fontWeight: 700,
                fontFamily: 'monospace',
                fontSize: '0.95rem',
              }}
            >
              {formatTime(timeRemaining)}
            </Typography>
          )}
          <Button
            size="small"
            variant="contained"
            onClick={handleSubmit}
            disabled={disabled || isSubmitting || isActiveTaskSubmitted || !currentCode.trim()}
            sx={{
              bgcolor: '#89b4fa',
              color: '#1e1e2e',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8rem',
              '&:hover': { bgcolor: '#74c7ec' },
              '&:disabled': { bgcolor: '#45475a', color: '#6c7086' },
            }}
          >
            {isSubmitting ? 'Submitting...' : isActiveTaskSubmitted ? 'Submitted ✓' : 'Submit Code'}
          </Button>
        </Box>
      </Box>

      {/* ── Error bar ── */}
      {error && (
        <Alert
          severity="error"
          sx={{
            borderRadius: 0,
            bgcolor: '#45475a',
            color: '#f38ba8',
            '& .MuiAlert-icon': { color: '#f38ba8' },
          }}
        >
          {error}
        </Alert>
      )}

      {/* ── Main body: problem (left) + editor (right) ── */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left pane — problem description (markdown) */}
        <Box
          sx={{
            width: '40%',
            overflowY: 'auto',
            borderRight: '1px solid #313244',
            bgcolor: '#1e1e2e',
            p: 3,
            '& h1, & h2, & h3': { color: '#cdd6f4', mt: 2, mb: 1 },
            '& p': { color: '#bac2de', lineHeight: 1.7, mb: 1.5 },
            '& code': {
              bgcolor: '#313244',
              color: '#a6e3a1',
              px: 0.8,
              py: 0.2,
              borderRadius: '4px',
              fontSize: '0.85em',
              fontFamily: '"Fira Code", "Cascadia Code", monospace',
            },
            '& pre': {
              bgcolor: '#11111b',
              border: '1px solid #313244',
              borderRadius: '6px',
              p: 2,
              overflowX: 'auto',
              my: 1.5,
            },
            '& pre code': {
              bgcolor: 'transparent',
              p: 0,
              color: '#cdd6f4',
            },
            '& ul, & ol': { color: '#bac2de', pl: 3 },
            '& li': { mb: 0.5 },
            '& blockquote': {
              borderLeft: '3px solid #89b4fa',
              pl: 2,
              ml: 0,
              color: '#a6adc8',
            },
            '& table': { borderCollapse: 'collapse', width: '100%', my: 1.5 },
            '& th, & td': {
              border: '1px solid #45475a',
              px: 1.5,
              py: 0.75,
              color: '#bac2de',
              fontSize: '0.85rem',
            },
            '& th': { bgcolor: '#313244', color: '#cdd6f4', fontWeight: 600 },
            '& strong': { color: '#cdd6f4' },
            '& em': { color: '#f9e2af' },
            '& hr': { border: 'none', borderTop: '1px solid #313244', my: 2 },
            '& a': { color: '#89b4fa' },
            /* scrollbar */
            '&::-webkit-scrollbar': { width: 6 },
            '&::-webkit-scrollbar-track': { bgcolor: '#11111b' },
            '&::-webkit-scrollbar-thumb': { bgcolor: '#45475a', borderRadius: 3 },
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: '#6c7086', letterSpacing: 1.5, mb: 1, display: 'block' }}
          >
            Problem Description
          </Typography>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeTask.text}</ReactMarkdown>
        </Box>

        {/* Right pane — Monaco editor */}
        <Box sx={{ width: '60%', display: 'flex', flexDirection: 'column' }}>
          {/* Editor sub-header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 0.75,
              bgcolor: '#11111b',
              borderBottom: '1px solid #313244',
            }}
          >
            <Typography variant="caption" sx={{ color: '#6c7086', fontFamily: 'monospace' }}>
              solution.{langKey === 'python' ? 'py' : langKey === 'javascript' ? 'js' : langKey === 'typescript' ? 'ts' : langKey === 'java' ? 'java' : langKey === 'cpp' ? 'cpp' : langKey === 'csharp' ? 'cs' : langKey === 'sql' ? 'sql' : langKey}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: charCount > MAX_CHARS * 0.9 ? '#f38ba8' : '#6c7086',
                fontFamily: 'monospace',
                fontWeight: charCount > MAX_CHARS * 0.9 ? 600 : 400,
              }}
            >
              {charCount} / {MAX_CHARS}
            </Typography>
          </Box>

          {/* Monaco */}
          <Box sx={{
            flex: 1,
            // Prevent Monaco from dimming/hiding cursor when window loses focus
            '& .monaco-editor .cursors-layer .cursor': { visibility: 'visible !important' },
          }}>
            <Editor
              height="100%"
              language={monacoLang}
              value={currentCode}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                wordWrap: 'on',
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                insertSpaces: true,
                readOnly: disabled || isSubmitting || isActiveTaskSubmitted,
                contextmenu: false,
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                padding: { top: 12 },
                renderLineHighlight: 'gutter',
                cursorBlinking: 'smooth',
                smoothScrolling: true,
              }}
              loading={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography sx={{ color: '#6c7086' }}>Loading editor...</Typography>
                </Box>
              }
            />
          </Box>
        </Box>
      </Box>

      {/* ── Bottom bar ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 0.75,
          bgcolor: '#181825',
          borderTop: '1px solid #313244',
        }}
      >
        <Typography variant="caption" sx={{ color: '#585b70', fontStyle: 'italic' }}>
          Copy, cut, and paste are disabled.
        </Typography>
        <Typography variant="caption" sx={{ color: '#585b70' }}>
          {langKey.toUpperCase()} | UTF-8
        </Typography>
      </Box>
    </Box>
  );
};

export default CodingEditor;
