import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';

const CodeEditor = ({ value, onChange, language, height = "500px" }) => {
  const editorRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const getMonacoLanguage = (lang) => {
    const languageMap = {
      python: 'python',
      javascript: 'javascript',
      nodejs: 'javascript',
      cpp: 'cpp',
    };
    return languageMap[lang] || 'python';
  };

  return (
    <div className="h-full">
      <Editor
        height={height}
        language={getMonacoLanguage(language)}
        value={value}
        onChange={onChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          fontFamily: 'Fira Code, Consolas, monospace',
        }}
      />
    </div>
  );
};

export default CodeEditor;
