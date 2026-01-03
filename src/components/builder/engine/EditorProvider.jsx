import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { createNode, cloneStructureWithNewIds } from '../lib/schema';

const EditorContext = createContext();

// Initial State (The "Empty" Page)
const initialState = {
    selectedId: null,
    historyIndex: 0,
    history: [
        {
            id: 'root',
            type: 'Body',
            props: { className: 'min-h-screen bg-slate-50 border-t-4 border-indigo-600' },
            children: [
                {
                    id: 'section-1',
                    type: 'Section',
                    props: { className: 'py-20 px-6 bg-white text-center' },
                    children: [
                        {
                            id: 'container-1',
                            type: 'Container',
                            props: { className: 'max-w-4xl mx-auto' },
                            children: [
                                { id: 'head-1', type: 'Heading', props: { tag: 'h1', text: 'Welcome to CMS 2.0', className: 'text-5xl font-extrabold text-slate-900 mb-6' } },
                                { id: 'text-1', type: 'Text', props: { text: 'Start building your professional website visually.', className: 'text-xl text-slate-600' } }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

// Actions
const TYPES = {
    SELECT: 'SELECT_ELEMENT',
    ADD: 'ADD_ELEMENT',
    UPDATE: 'UPDATE_ELEMENT',
    MOVE: 'MOVE_ELEMENT',
    DELETE: 'DELETE_ELEMENT',
    UNDO: 'UNDO',
    REDO: 'REDO',
    LOAD: 'LOAD_PAGE'
};

// Helper: Deep Clone
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// Helper: Find Node & Parent by ID
const findNode = (root, id) => {
    if (root.id === id) return { node: root, parent: null, index: -1 };

    // Stack based search would be better for deep trees, but recursion is fine for < 1000 nodes
    for (let i = 0; i < (root.children?.length || 0); i++) {
        const child = root.children[i];
        if (child.id === id) return { node: child, parent: root, index: i };

        const result = findNode(child, id);
        if (result) return result;
    }
    return null;
};

// Reducer
const editorReducer = (state, action) => {
    const currentTree = state.history[state.historyIndex];
    let newTree = clone(currentTree); // Start with a copy

    switch (action.type) {
        case TYPES.SELECT:
            return { ...state, selectedId: action.payload };

        case TYPES.UPDATE: {
            const { id, updates } = action.payload;
            const target = findNode(newTree, id);
            if (target) {
                target.node.props = { ...target.node.props, ...updates };
                // Commit to history
                const newHistory = [...state.history.slice(0, state.historyIndex + 1), newTree];
                return {
                    ...state,
                    history: newHistory,
                    historyIndex: newHistory.length - 1
                };
            }
            return state;
        }

        case TYPES.ADD: {
            // payload: { parentId, type, index, structure? }
            const { parentId, type, index, structure } = action.payload;

            // Create or Clone Node
            let newNode;
            if (structure) {
                newNode = cloneStructureWithNewIds(structure);
            } else {
                newNode = createNode(type);
            }

            const target = findNode(newTree, parentId);

            if (target && target.node.children) {
                // Insert at specific index or end
                const idx = typeof index === 'number' ? index : target.node.children.length;
                target.node.children.splice(idx, 0, newNode);

                const newHistory = [...state.history.slice(0, state.historyIndex + 1), newTree];
                return {
                    ...state,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                    selectedId: newNode.id // Auto select new
                };
            }
            return state;
        }

        case TYPES.DELETE: {
            const { id } = action.payload;
            const target = findNode(newTree, id);
            if (target && target.parent) {
                target.parent.children.splice(target.index, 1);

                const newHistory = [...state.history.slice(0, state.historyIndex + 1), newTree];
                return {
                    ...state,
                    history: newHistory,
                    historyIndex: newHistory.length - 1,
                    selectedId: null
                };
            }
            return state;
        }

        case TYPES.LOAD:
            return {
                ...state,
                history: [action.payload], // Reset history on load
                historyIndex: 0,
                selectedId: null
            };

        case TYPES.UNDO:
            return {
                ...state,
                historyIndex: Math.max(0, state.historyIndex - 1)
            };

        case TYPES.REDO:
            return {
                ...state,
                historyIndex: Math.min(state.history.length - 1, state.historyIndex + 1)
            };

        default:
            return state;
    }
};

export const EditorProvider = ({ children }) => {
    const [state, dispatch] = useReducer(editorReducer, initialState);

    // Convenience Wrappers
    const actions = {
        select: (id) => dispatch({ type: TYPES.SELECT, payload: id }),
        update: (id, updates) => dispatch({ type: TYPES.UPDATE, payload: { id, updates } }),
        add: (parentId, element, payload = {}) => dispatch({ type: TYPES.ADD, payload: { parentId, type: element, ...payload } }),
        delete: (id) => dispatch({ type: TYPES.DELETE, payload: { id } }),
        load: (pageData) => dispatch({ type: TYPES.LOAD, payload: pageData }),
        undo: () => dispatch({ type: TYPES.UNDO }),
        redo: () => dispatch({ type: TYPES.REDO })
    };

    const currentTree = state.history[state.historyIndex];

    return (
        <EditorContext.Provider value={{ state: { ...state, tree: currentTree }, actions }}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => useContext(EditorContext);
