import { FC, memo } from "react";
import ReactMarkdown, { Options } from "react-markdown";

interface MemoizedMarkdownProps extends Partial<Options> {
    children: string;
}

const MemoizedReactMarkdown: FC<MemoizedMarkdownProps> = memo(
    ReactMarkdown,
    (prevProps, nextProps) =>
        prevProps.children === nextProps.children && prevProps.className === nextProps.className
);

export default MemoizedReactMarkdown;
