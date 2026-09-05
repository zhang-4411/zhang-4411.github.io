// 代码块功能依赖

$(function () {
    // Hexo marked 会为带行号的代码生成 gutter 和 code 两个 pre。
    // 只包装真正的代码区域，避免行号区域也生成一套圆点、复制和收起按钮。
    $('figure.highlight td.code > pre').wrap('<div class="code-area" style="position: relative"></div>');

    // 兼容没有 figure.highlight/行号表格的普通代码块。
    $('pre').not('.code-area pre, figure.highlight td.gutter > pre').wrap('<div class="code-area" style="position: relative"></div>');
});
