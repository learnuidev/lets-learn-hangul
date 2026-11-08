import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'

interface MarkdownProps {
  source: string
  className?: string
}

/**
 * Renders the authored course copy. The original used remarkable with
 * `html: true, breaks: true`, so raw HTML and single newlines both pass
 * through to the DOM.
 */
export function Markdown({ source, className }: MarkdownProps) {
  return (
    <div className={cn('markdown', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[rehypeRaw]}
        components={{
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img {...props} alt={props.alt ?? ''} />
          ),
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}
