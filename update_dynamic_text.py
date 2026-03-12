import re

with open('src/components/DynamicEpisodeText.tsx', 'r') as f:
    content = f.read()

# Update props
content = content.replace(
"""export default function DynamicEpisodeText({
  description,
  className,
  expandable = false,
  stripFeedback = false
}: {
  description: string,
  className?: string,
  expandable?: boolean,
  stripFeedback?: boolean
}) {""",
"""export default function DynamicEpisodeText({
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
}) {"""
)

# Insert maxParagraphs logic right after stripFeedback logic inside useMemo
replacement = """    if (!maxParagraphs) return workingDescription;

    try {
      const parser = new DOMParser();
      // workingDescription might just be text with <br/> tags.
      // Let's wrap it in a div to properly parse it as HTML body content.
      const doc = parser.parseFromString(workingDescription, 'text/html');

      let paragraphsFound = 0;
      let truncateNode = null;
      let isBrSequence = false;

      // Basic approach: Count block-level elements (<p>, <div>, etc) OR double <br> tags.
      // Since the code above replaces \\n\\n+ with <br /><br />, we count <br> pairs as paragraph separators.

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
"""

content = content.replace("if (!stripFeedback) return workingDescription;", "if (!stripFeedback && !maxParagraphs) return workingDescription;")
content = content.replace(
"""      findAndStrip(doc.body);
      return doc.body.innerHTML.trim();
    } catch (e) {
      return workingDescription;
    }
  }, [description, stripFeedback]);""",
f"""      findAndStrip(doc.body);
      workingDescription = doc.body.innerHTML.trim();
    }} catch (e) {{
      // Ignore
    }}

{replacement}

  }}, [description, stripFeedback, maxParagraphs]);"""
)

with open('src/components/DynamicEpisodeText.tsx', 'w') as f:
    f.write(content)
