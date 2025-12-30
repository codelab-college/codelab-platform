import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SANDBOX_DIR = path.join(__dirname, '../sandbox');
const MAX_EXECUTION_TIME = parseInt(process.env.MAX_EXECUTION_TIME) || 5000;

// Ensure sandbox directory exists
async function ensureSandboxDir() {
  try {
    await fs.access(SANDBOX_DIR);
  } catch {
    await fs.mkdir(SANDBOX_DIR, { recursive: true });
  }
}

// Execute code in a sandboxed environment
export async function executeCode(code, language, input) {
  await ensureSandboxDir();

  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(7);
  const fileId = `${timestamp}_${randomId}`;

  try {
    let result;
    
    switch (language) {
      case 'python':
        result = await executePython(code, input, fileId);
        break;
      case 'javascript':
      case 'nodejs':
        result = await executeJavaScript(code, input, fileId);
        break;
      case 'cpp':
        result = await executeCpp(code, input, fileId);
        break;
      default:
        throw new Error(`Unsupported language: ${language}`);
    }

    return result;
  } finally {
    // Cleanup temporary files
    await cleanup(fileId, language);
  }
}

// Execute Python code
async function executePython(code, input, fileId) {
  const filePath = path.join(SANDBOX_DIR, `${fileId}.py`);
  await fs.writeFile(filePath, code);

  return executeProcess('python', [filePath], input);
}

// Execute JavaScript/Node.js code
async function executeJavaScript(code, input, fileId) {
  const filePath = path.join(SANDBOX_DIR, `${fileId}.js`);
  await fs.writeFile(filePath, code);

  return executeProcess('node', [filePath], input);
}

// Execute C++ code
async function executeCpp(code, input, fileId) {
  const sourceFile = path.join(SANDBOX_DIR, `${fileId}.cpp`);
  const executableFile = path.join(SANDBOX_DIR, `${fileId}.exe`);
  
  await fs.writeFile(sourceFile, code);

  // Compile
  const compileResult = await executeProcess('g++', [sourceFile, '-o', executableFile], '');
  
  if (compileResult.error) {
    return {
      output: '',
      error: `Compilation Error: ${compileResult.error}`,
      executionTime: 0,
      timeout: false
    };
  }

  // Execute
  return executeProcess(executableFile, [], input);
}

// Generic process execution with timeout
function executeProcess(command, args, input) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let output = '';
    let error = '';
    let timeout = false;

    const process = spawn(command, args, {
      timeout: MAX_EXECUTION_TIME,
      killSignal: 'SIGKILL'
    });

    // Set timeout manually
    const timer = setTimeout(() => {
      timeout = true;
      process.kill('SIGKILL');
    }, MAX_EXECUTION_TIME);

    // Provide input
    if (input) {
      process.stdin.write(input);
      process.stdin.end();
    }

    // Capture output
    process.stdout.on('data', (data) => {
      output += data.toString();
    });

    // Capture errors
    process.stderr.on('data', (data) => {
      error += data.toString();
    });

    // Handle completion
    process.on('close', (code) => {
      clearTimeout(timer);
      const executionTime = Date.now() - startTime;

      resolve({
        output: output.trim(),
        error: error.trim() || (code !== 0 && !timeout ? `Process exited with code ${code}` : null),
        executionTime,
        timeout
      });
    });

    // Handle errors
    process.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        output: '',
        error: err.message,
        executionTime: Date.now() - startTime,
        timeout: false
      });
    });
  });
}

// Cleanup temporary files
async function cleanup(fileId, language) {
  try {
    const extensions = {
      python: ['.py'],
      javascript: ['.js'],
      nodejs: ['.js'],
      cpp: ['.cpp', '.exe', '.out']
    };

    const exts = extensions[language] || [];
    
    for (const ext of exts) {
      try {
        await fs.unlink(path.join(SANDBOX_DIR, `${fileId}${ext}`));
      } catch {
        // Ignore cleanup errors
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
