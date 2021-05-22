window.oncontextmenu = function (e) {
    // 禁用右键菜单
    e.preventDefault();
}
window.onselectstart = function(e) {
    // 禁用鼠标拖动选中
    e.preventDefault();
}