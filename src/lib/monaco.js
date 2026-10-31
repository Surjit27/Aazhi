import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/editor/editor.worker.js?worker'
import jsonWorker from 'monaco-editor/language/json/json.worker.js?worker'
import { loader } from '@monaco-editor/react'

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') return new jsonWorker()
    return new editorWorker()
  },
}

loader.config({ monaco })
