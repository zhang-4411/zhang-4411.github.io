// 代码块一键复制

$(function () {
    var $copyIcon = $('<button type="button" class="fas fa-copy code_copy" title="复制代码" aria-label="复制代码"></button>')
    var $notice = $('<div class="codecopy_notice" role="status" aria-live="polite"></div>')
    $('.code-area').prepend($copyIcon)
    $('.code-area').prepend($notice)
    function notice(ctx, message) {
        $(ctx).prev('.codecopy_notice')
            .stop(true, true)
            .text(message)
            .animate({ opacity: 1, top: 30 }, 300, function () {
                setTimeout(function () {
                    $(ctx).prev('.codecopy_notice').animate({ opacity: 0, top: 0 }, 500)
                    }, 1800)
            })
    }

    function clearSelection() {
        var selection = window.getSelection()
        if (selection) selection.removeAllRanges()
    }

    // 优先使用现代 Clipboard API；失败时回退到 execCommand。
    // 不限制 isSecureContext：localhost 的浏览器实现可能提供 Clipboard API，
    // 但未正确标记安全上下文。
    function copy(text, ctx, onSuccess) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            navigator.clipboard.writeText(text)
                .then(function () {
                    notice(ctx, "复制成功")
                    onSuccess()
                })
                .catch(function () { fallbackCopy(text, ctx, onSuccess) })
            return
        }
        fallbackCopy(text, ctx, onSuccess)
    }

    function fallbackCopy(text, ctx, onSuccess) {
        var textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.top = '0'
        textarea.style.left = '-9999px'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        var success = false
        try { success = document.execCommand('copy') } catch (ex) { success = false }
        document.body.removeChild(textarea)
        if (success) {
            notice(ctx, "复制成功")
            onSuccess()
        } else {
            // 保留代码选区，用户可直接按 Ctrl/Cmd+C 完成复制。
            notice(ctx, "复制失败，请按 Ctrl+C")
        }
    }
    // 复制
    $(document).on('click', '.code-area .code_copy', function (event) {
        event.preventDefault()
        var $pre = $(this).siblings('pre')
        // Hexo marked 的高亮代码是 pre > span.line，没有 code 包裹；普通代码块才是 pre > code。
        var $target = $pre.find('code')
        if (!$target.length) $target = $pre
        var selection = window.getSelection()
        var range = document.createRange()
        range.selectNodeContents($target[0])
        selection.removeAllRanges()
        selection.addRange(range)
        var text = $target[0].textContent
        notice(this, "复制中…")
        copy(text, this, clearSelection)
    })
});
