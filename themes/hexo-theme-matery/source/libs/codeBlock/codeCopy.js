// 代码块一键复制

$(function () {
    var $copyIcon = $('<i class="fas fa-copy code_copy" title="复制代码" aria-hidden="true"></i>')
    var $notice = $('<div class="codecopy_notice"></div>')
    $('.code-area').prepend($copyIcon)
    $('.code-area').prepend($notice)
    function notice(ctx, message) {
        $(ctx).prev('.codecopy_notice')
            .stop(true, true)
            .text(message)
            .animate({ opacity: 1, top: 30 }, 300, function () {
                setTimeout(function () {
                    $(ctx).prev('.codecopy_notice').animate({ opacity: 0, top: 0 }, 500)
                }, 900)
            })
    }

    // 优先使用现代 Clipboard API；旧浏览器再回退到 execCommand。
    function copy(text, ctx) {
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text)
                .then(function () { notice(ctx, "复制成功") })
                .catch(function () { fallbackCopy(text, ctx) })
            return
        }
        fallbackCopy(text, ctx)
    }

    function fallbackCopy(text, ctx) {
        var textarea = document.createElement('textarea')
        textarea.value = text
        textarea.setAttribute('readonly', '')
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        var success = false
        try { success = document.execCommand('copy') } catch (ex) { success = false }
        document.body.removeChild(textarea)
        notice(ctx, success ? "复制成功" : "复制失败，请手动复制")
    }
    // 复制
    $('.code-area .fa-copy').on('click', function () {
        var selection = window.getSelection()
        var range = document.createRange()
        range.selectNodeContents($(this).siblings('pre').find('code')[0])
        selection.removeAllRanges()
        selection.addRange(range)
        var text = selection.toString()
        copy(text, this)
        selection.removeAllRanges()
    })
});
