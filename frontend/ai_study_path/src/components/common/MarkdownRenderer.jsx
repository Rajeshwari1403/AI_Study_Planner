import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism';

const MarkdownRenderer = ({ content }) => {
    return (
        <div className="text-black leading-relaxed text-sm space-y-2">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-black mt-6 mb-3 border-b border-black-700 pb-1" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold text-black mt-5 mb-2.5" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-medium text-black mt-4 mb-2" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="text-base font-medium text-black mt-3 mb-1" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-4 text-black-300 last:mb-0 leading-relaxed" {...props} />,
                    a: ({ node, ...props }) => <a className="text-black-400 underline hover:text-black transition-colors target='_blank' rel='noopener noreferrer'" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4 space-y-1 text-black" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4 space-y-1 text-black" {...props} />,
                    li: ({ node, ...props }) => <li className="marker:text-black" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-black" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-black" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-black-600 bg-black-800/40 pl-4 py-1 my-4 italic text-black-400 rounded-r" {...props} />,
                    code: ({ node, inline, className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <SyntaxHighlighter
                                style={dracula}
                                language={match[1]}
                                PreTag="div"
                                className="rounded-xl border border-black my-4 shadow-md !bg-black-950/80"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className="bg-black-800 text-black px-1.5 py-0.5 rounded text-xs font-mono border border-black-700/50" {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ node, ...props }) => <pre className="bg-transparent p-0 m-0" {...props} />,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;