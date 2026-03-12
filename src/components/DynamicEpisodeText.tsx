import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';

export default function DynamicEpisodeText({
  description,
  className,
  expandable = false,
  stripFeedback = false,
  maxParagraphs
}: {
  description: string,
  className?: string,
  expandable?: boolean,
  stripFeedback?: boolean,
  maxParagraphs?: number
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanDescription = useMemo(() => {
    if (!description) return '';
    if (typeof window === 'undefined') return description;

    // Convert raw text newlines to <br> tags so they render correctly, even when mixed with HTML.
    let workingDescription = description.replace(/\r\n/g, '\n');
    workingDescription = workingDescription.replace(/\n\n+/g, '<br /><br />');
    workingDescription = workingDescription.replace(/\n/g, '<br />');

    if (!stripFeedback && !maxParagraphs) return workingDescription;

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(workingDescription, 'text/html');
      const feedbackText = "Euer Feedback ist uns wichtig!";

      let found = false;
      function findAndStrip(node: Node) {
        if (found) return;

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          const index = text.indexOf(feedbackText);
          if (index !== -1) {
            node.textContent = text.substring(0, index).trim();
            found = true;

            // Remove following siblings
            let sibling = node.nextSibling;
            while (sibling) {
              const next = sibling.nextSibling;
              node.parentElement?.removeChild(sibling);
              sibling = next;
            }

            // Move up and remove following siblings of ancestors
            let parent = node.parentElement;
            while (parent && parent !== doc.body) {
              let pSibling = parent.nextSibling;
              while (pSibling) {
                const next = pSibling.nextSibling;
                parent.parentElement?.removeChild(pSibling);
                pSibling = next;
              }
              parent = parent.parentElement;
            }
          }
        } else {
          const children = Array.from(node.childNodes);
          for (const child of children) {
            findAndStrip(child);
          }
        }
      }

      findAndStrip(doc.body);
      workingDescription = doc.body.innerHTML.trim();
    } catch (e) {
      // Ignore
    }

    if (!maxParagraphs) return workingDescription;

    try {
      const parser = new DOMParser();
      // workingDescription might just be text with <br/> tags.
      // Let's wrap it in a div to properly parse it as HTML body content.
      const doc = parser.parseFromString(workingDescription, 'text/html');

      let paragraphsFound = 0;
      let truncateNode = null;
      let isBrSequence = false;

      // Basic approach: Count block-level elements (<p>, <div>, etc) OR double <br> tags.
      // Since the code above replaces \n\n+ with <br /><br />, we count <br> pairs as paragraph separators.

      const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
      let currentNode = walker.nextNode();

      let lastWasBr = false;

      while (currentNode) {
         if (currentNode.nodeType === Node.ELEMENT_NODE && currentNode.nodeName.toLowerCase() === 'br') {
             if (lastWasBr) {
                 paragraphsFound++;
                 lastWasBr = false; // Reset to avoid counting 3 brs as 2 paragraphs

                 if (paragraphsFound >= maxParagraphs) {
                     truncateNode = currentNode;
                     break;
                 }
             } else {
                 lastWasBr = true;
             }
         } else if (currentNode.nodeType === Node.ELEMENT_NODE && ['p', 'div', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(currentNode.nodeName.toLowerCase())) {
             // If we hit a block element, that's a new paragraph block implicitly
             paragraphsFound++;
             lastWasBr = false;

             if (paragraphsFound > maxParagraphs) {
                 // Stop before this node
                 truncateNode = currentNode;
                 break;
             }
         } else if (currentNode.nodeType === Node.TEXT_NODE && currentNode.textContent?.trim().length > 0) {
             lastWasBr = false;
         }

         currentNode = walker.nextNode();
      }

      if (truncateNode) {
          // We need to remove truncateNode and everything after it
          // First, remove all following siblings of the truncateNode
          let sibling = truncateNode.nextSibling;
          while (sibling) {
              const next = sibling.nextSibling;
              truncateNode.parentElement?.removeChild(sibling);
              sibling = next;
          }

          // Then move up the tree and remove following siblings of ancestors, up to the body
          let parent = truncateNode.parentElement;
          while (parent && parent !== doc.body) {
              let pSibling = parent.nextSibling;
              while (pSibling) {
                  const next = pSibling.nextSibling;
                  parent.parentElement?.removeChild(pSibling);
                  pSibling = next;
              }
              parent = parent.parentElement;
          }

          // Finally remove the truncateNode itself (which is either the extra paragraph or the second <br>)
          truncateNode.parentElement?.removeChild(truncateNode);
      }

      return doc.body.innerHTML.trim();
    } catch (e) {
      console.error("Error truncating paragraphs:", e);
      return workingDescription;
    }


  }, [description, stripFeedback, maxParagraphs]);

  const { excerptHtml, isTruncatable } = useMemo(() => {
    if (!cleanDescription || typeof window === 'undefined') return { excerptHtml: cleanDescription, isTruncatable: false };

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanDescription, 'text/html');
      let totalSentencesFound = 0;
      let truncationPointReached = false;

      function processNode(node: Node) {
        if (truncationPointReached) return;

        if (node.nodeType === Node.TEXT_NODE) {
          const text = node.textContent || "";
          // Split by sentence endings (. ! ?) followed by space or end of string, keeping the delimiter
          const parts = text.split(/([.!?](?:\s|$))/);
          let newText = "";

          for (let i = 0; i < parts.length; i++) {
            newText += parts[i];
            // Delimiters are at odd indices because of the capturing group in split()
            if (i % 2 === 1) {
              totalSentencesFound++;
              if (totalSentencesFound === 4) {
                node.textContent = newText.trim();
                truncationPointReached = true;
                break;
              }
            }
          }

          // If we finished the text node and didn't reach 4 sentences,
          // node.textContent remains the full original text of this node.
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const children = Array.from(node.childNodes);
          for (const child of children) {
            if (truncationPointReached) {
              node.removeChild(child);
            } else {
              processNode(child);
            }
          }
        }
      }

      processNode(doc.body);

      return {
        excerptHtml: doc.body.innerHTML,
        isTruncatable: truncationPointReached
      };
    } catch (e) {
      console.error("Error truncating description:", e);
      return { excerptHtml: cleanDescription, isTruncatable: false };
    }
  }, [cleanDescription]);

  if (!cleanDescription) return null;

  const showExcerpt = expandable && !isExpanded && isTruncatable;

  return (
    <div className="relative">
      <div className={`prose-custom ${className || ''}`}>
        <div
          className="transition-all duration-500 ease-in-out"
          dangerouslySetInnerHTML={{ __html: showExcerpt ? excerptHtml : cleanDescription }}
        />
      </div>

      {expandable && isTruncatable && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="mt-2 text-f1red hover:text-white text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1 transition-colors group"
        >
          {isExpanded ? (
            <>Weniger lesen <ChevronDown className="w-3 h-3 rotate-180 transition-transform" /></>
          ) : (
            <>Mehr lesen <ChevronDown className="w-3 h-3 transition-transform group-hover:translate-y-0.5" /></>
          )}
        </button>
      )}
    </div>
  );
}
