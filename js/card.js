'use strict';

var test;

(function() {

    var timeout;
    var storageList;

    window.onload = function() {
        if (window.innerWidth < 400) {
            document.body.style.background = 'url(\'../images/background-mobile.jpg\')'
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundSize = 'cover';
        } else if (window.innerWidth >= 400 && window.innerWidth < 1100) {
            document.body.style.background = 'url(\'../images/background-mobile-wide.jpg\')'
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.backgroundSize = 'cover';
        }

        if (localStorage.storageList) {
            loadLocalStorage(localStorage.storageList);
        }

        document.getElementById('head-complete').ontouchend = function() {
            clearCompleted();
        };
        document.getElementById('head-complete').onclick = document.getElementById('head-complete').ontouchend;

        document.getElementById('item-new-folder').ontouchend = document.getElementById('item-new-folder').onclick = function() {
            addFolder(this.parentElement.parentElement.parentElement);
        };

        document.querySelectorAll('#search-label span').forEach(function(label) {
            label.ontouchend = label.onclick = function() {
                var all = this.parentElement.firstElementChild;
                var active = all.nextElementSibling;
                var completed = active.nextElementSibling;
                all.classList.remove('selected');
                active.classList.remove('selected');
                completed.classList.remove('selected');
        
                this.classList.add('selected');
                filterByLabel(this.id);
            };
        });

        document.getElementById('bar-key').oninput = function() {
            var keyword = this.value;
            clearTimeout(timeout);
            timeout = setTimeout(function() {
                if (keyword.length > 0) {
                    document.querySelectorAll('#search-label .selected').forEach(function(label) {
                        label.click();
                    });
                    filterByKeyword(keyword.toLowerCase());
                } else {
                    document.getElementById('label-all').click();
                }
            }, 1000);
        };

        updateEventListener();
    };

    var filterByKeyword = function(word) {
        console.log('search by ' + word);
        var list = document.getElementById('sec-list');
        var folder = list.firstElementChild;

        while (folder) {
            var info = folder.firstElementChild;
            var content = info.nextElementSibling;
            if (!content) { break; }
            expandFolder(content);
            var item = content.firstElementChild;
            while (item) {
                var itemContent = item.firstElementChild.nextElementSibling;
                if (!itemContent) { break; }
                var itemName = itemContent.firstElementChild;
                if (!itemName.value.toLowerCase().includes(word)) {
                    item.classList.add('item-filtered');
                }
                item = item.nextElementSibling;
            }
            folder = folder.nextElementSibling;
        }
    };

    var filterByLabel = function(label) {
        var list = document.getElementById('sec-list');
        var folder = list.firstElementChild;
        var content, item;

        switch (label) {
        case 'label-all':
            while (folder) {
                content = folder.firstElementChild.nextElementSibling;
                if (!content) { break; }
                
                item = content.firstElementChild;
                while (item) {
                    item.classList.remove('item-filtered');
                    item = item.nextElementSibling;
                }
                folder = folder.nextElementSibling;
            }
            break;
        case 'label-active':
            while (folder) {
                content = folder.firstElementChild.nextElementSibling;
                if (!content) { break; }
                expandFolder(content);
                item = content.firstElementChild;
                while (item) {
                    if (item.firstElementChild.classList.contains('item-checked')) {
                        item.classList.add('item-filtered');
                    } else {
                        item.classList.remove('item-filtered');
                    }
                    item = item.nextElementSibling;
                }
                folder = folder.nextElementSibling;
            }
            break;
        case 'label-completed':
            while (folder) {
                content = folder.firstElementChild.nextElementSibling;
                if (!content) { break; }
                expandFolder(content);
                item = content.firstElementChild;
                while (item) {
                    if (!item.firstElementChild.classList.contains('item-checked')) {
                        item.classList.add('item-filtered');
                    } else {
                        item.classList.remove('item-filtered');
                    }
                    item = item.nextElementSibling;
                }
                folder = folder.nextElementSibling;
            }
            break;
        }
    };

    var addFolder = function(list, withname) {
        $(list).animate({ scrollTop: 0 }, 500);

        var del = document.createElement('div');
        del.classList.add('folder-delete');
        del.innerHTML = '+';

        var name = document.createElement('input');
        name.classList.add('folder-name');
        name.placeholder = 'New Folder';

        var collapse = document.createElement('div');
        collapse.classList.add('folder-item', 'item-btn', 'item-collapse');
        collapse.innerHTML = 'collapse';
        var clear = document.createElement('div');
        clear.classList.add('folder-item', 'item-btn', 'item-clear');
        clear.innerHTML = 'clear';
        var add = document.createElement('div');
        add.classList.add('folder-item', 'item-btn', 'item-add');
        add.innerHTML = 'add';

        var folderInfo = document.createElement('div');
        folderInfo.classList.add('folder-info');
        folderInfo.appendChild(del);
        folderInfo.appendChild(name);
        folderInfo.appendChild(collapse);
        folderInfo.appendChild(clear);
        folderInfo.appendChild(add);

        var folderContent = document.createElement('div');
        folderContent.classList.add('folder-content');

        var folderLeft = document.createElement('div');
        folderLeft.classList.add('folder-left');
        folderLeft.innerHTML = ' 0 item left';

        var folderLeftInfo = document.createElement('div');
        folderLeftInfo.classList.add('folder-info');
        folderLeftInfo.appendChild(folderLeft);

        var folder = document.createElement('div');
        folder.classList.add('list-folder');
        folder.appendChild(folderInfo);
        folder.appendChild(folderContent);
        folder.appendChild(folderLeftInfo);

        $(list).prepend(folder);
        updateEventListener();

        if (withname) {
            name.value = withname;
        } else {
            name.focus();
        }

        return folder;
    };

    var deleteFolder = function(folder) {
        var confirmDel = confirm('Do you want to delete the folder? ' +
        'The operation cannot be restored.');
        if (confirmDel) {
            folder.remove();
        }

        updateEventListener();
    };

    var addItemToFolder = function(folder, options) {
        var itemTitle = document.createElement('input');
        var itemIntro = document.createElement('div');
        itemTitle.type = 'text';
        itemTitle.placeholder = 'New card item';
        itemTitle.classList.add('item-title');
        itemIntro.classList.add('item-intro');
        
        var itemContent = document.createElement('div');
        itemContent.classList.add('item-content');
        itemContent.appendChild(itemTitle);
        itemContent.appendChild(itemIntro);

        var itemCheck = document.createElement('div');
        itemCheck.classList.add('item-check');
        var itemDelete = document.createElement('div');
        itemDelete.classList.add('item-delete');
        itemDelete.innerHTML = '+';

        var folderItem = document.createElement('div');
        folderItem.classList.add('folder-item');
        folderItem.appendChild(itemCheck);
        folderItem.appendChild(itemContent);
        folderItem.appendChild(itemDelete);

        var child = folder.firstElementChild;
        if (child && child.classList.contains('item-common')) {
            setTimeout(function() {
                folderItem.classList.add('item-common');
                updateEventListener();
            }, 100);
        } else {
            while (child) {
                if (child.classList.contains('item-front')) {
                    child.classList.replace('item-front', 'item-middle');
                } else if (child.classList.contains('item-middle')) {
                    child.classList.replace('item-middle', 'item-back');
                } else if (child.classList.contains('item-back')) {
                    child.classList.add('item-hidden');
                }
                child = child.nextElementSibling;
            }

            if (!options) {
                setTimeout(function() {
                    folderItem.classList.add('item-front');
                    updateEventListener();
                }, 100);
            } else {
                folderItem.classList.add('item-front');
                updateEventListener();
            }
        }
        $(folder).prepend(folderItem);

        if (!options) {
            var date = new Date();
            itemTitle.focus();
            itemIntro.innerHTML = date.getHours() + ':' + date.getMinutes() + ' ' + date.toDateString();
        } else {
            itemTitle.value = options.title;
            itemIntro.innerHTML = options.time;
            if (options.checked) {
                itemCheck.classList.add('item-checked');
                itemTitle.classList.add('item-checked');
                itemIntro.classList.add('item-checked');
            }
        }
    };

    var deleteFolderItem = function(item) {
        if (item.classList.contains('item-common')) {
            item.classList.remove('item-common');
        } else {
            item.classList.remove('item-front');
            item.classList.remove('item-middle');
            item.classList.remove('item-back');

            var child = item.parentElement.firstElementChild;
            var already = false;
            while (child) {
                if (child.classList.contains('item-middle')) {
                    child.classList.replace('item-middle', 'item-front');
                } else if (child.classList.contains('item-back') &&
                !child.classList.contains('item-hidden')) {
                    child.classList.replace('item-back', 'item-middle');
                } else if (child.classList.contains('item-back') &&
                child.classList.contains('item-hidden') && !already) {
                    already = true;
                    child.classList.remove('item-hidden');
                }
                child = child.nextElementSibling;
            }
        }

        setTimeout(function() {
            item.remove();
            updateEventListener();
        }, 300);
    };

    var checkItem = function(check) {
        check.classList.add('item-checked');
        check.ontouchend = check.onclick = function(e) {
            e.cancelBubble = true;
            uncheckItem(check);
        };

        var item = check.parentElement;
        var content = item.firstElementChild.nextElementSibling;
        content.firstElementChild.classList.add('item-checked');
        content.firstElementChild.nextElementSibling.classList.add('item-checked');

        document.querySelectorAll('#search-label .selected').forEach(function(label) {
            if (label.id != 'label-all') {
                label.click();
            }
        });
        updateEventListener();
    };

    var uncheckItem = function(check) {
        check.classList.remove('item-checked');
        check.ontouchend = check.onclick = function(e) {
            e.cancelBubble = true;
            checkItem(check);
        };

        var item = check.parentElement;
        var content = item.firstElementChild.nextElementSibling;
        content.firstElementChild.classList.remove('item-checked');
        content.firstElementChild.nextElementSibling.classList.remove('item-checked');
        
        document.querySelectorAll('#search-label .selected').forEach(function(label) {
            if (label.id != 'label-all') {
                label.click();
            }
        });
        updateEventListener();
    };

    var clearFolder = function(folder) {
        var child = folder.firstElementChild;
        while (child) {
            deleteFolderItem(child);
            child = child.nextElementSibling;
        }
    };

    var clearCompleted = function() {
        var list = document.getElementById('sec-list');
        var folder = list.firstElementChild;
        while (folder) {
            var content = folder.firstElementChild.nextElementSibling;
            if (!content) { break; }
            var item = content.firstElementChild;
            while (item) {
                if (item.firstElementChild.classList.contains('item-checked')) {
                    deleteFolderItem(item);
                }
                item = item.nextElementSibling;
            }
            folder = folder.nextElementSibling;
        }
    };

    var expandFolder = function(folder) {
        var child = folder.firstElementChild;
        while (child) {
            child.classList.remove('item-front');
            child.classList.remove('item-middle');
            child.classList.remove('item-back');
            child.classList.remove('item-hidden');
            child.classList.add('item-common');
            child = child.nextElementSibling;
        }

        updateEventListener();
    };

    var collapseFolder = function(folder) {
        document.getElementById('label-all').click();

        var child = folder.firstElementChild;
        child.classList.remove('item-common');
        child.classList.add('item-front');
        child = child.nextElementSibling;
        if (child) {
            child.classList.remove('item-common');
            child.classList.add('item-middle');
            child = child.nextElementSibling;
            if (child) {
                child.classList.remove('item-common');
                child.classList.add('item-back');
                child = child.nextElementSibling;
                while (child) {
                    child.classList.remove('item-common');
                    child.classList.add('item-back');
                    child.classList.add('item-hidden');
                    child = child.nextElementSibling;
                }
            }
        }

        updateEventListener();
    };

    var loadLocalStorage = function(json) {
        var prevStorageList = JSON.parse(json);
        var list = document.getElementById('sec-list');

        console.log(prevStorageList);
        for (var i = prevStorageList.length - 1; i >= 0 ; i--) {

            var folderName = prevStorageList[i].name;
            var folderItems = prevStorageList[i].items;
            var folder = addFolder(list, folderName);

            for (var j = folderItems.length - 1; j >= 0; j--) {
                var itemChecked = folderItems[j].checked;
                var itemTitle = folderItems[j].title;
                var itemTime = folderItems[j].time;

                addItemToFolder(folder.firstElementChild.nextElementSibling, {
                    checked: itemChecked,
                    title: itemTitle,
                    time: itemTime
                });
            }
        }
    }

    var updateLocalStorage = function() {
        storageList = [];

        var list = document.getElementById('sec-list');
        var folder = list.firstElementChild;

        while (folder) {
            var storageFolder = {};

            var info = folder.firstElementChild;
            var content = info.nextElementSibling;
            if (!content) { break; }
            
            var folderName = info.firstElementChild.nextElementSibling;

            var storageItems = [];
            var item = content.firstElementChild;
            while (item) {
                var itemChecked = item.firstElementChild;
                
                var itenInfo = itemChecked.nextElementSibling;
                if (!itenInfo) {break;}
                
                var itemName = itenInfo.firstElementChild;
                var itemTime = itemName.nextElementSibling;
                
                storageItems.push({
                    checked: itemChecked.classList.contains('item-checked'),
                    title: itemName.value,
                    time: itemTime.innerHTML
                });

                item = item.nextElementSibling;
            }

            storageFolder = {
                name: folderName.value,
                items: storageItems
            };
            storageList.push(storageFolder);
            folder = folder.nextElementSibling;
        }

        localStorage.setItem("storageList", JSON.stringify(storageList));
    }

    var updateEventListener = function() {
        // document.getElementById

        document.querySelectorAll('.folder-content').forEach(function(content) {
            if (!content.firstElementChild) {
                var empty = document.createElement('div');
                empty.classList.add('folder-item');
                empty.classList.add('item-empty');
                empty.innerHTML = 'click <strong>add</strong> to create a new item card'
                content.appendChild(empty);
            } else if (!content.firstElementChild.classList.contains('item-empty')) {
                var last = content.lastElementChild;
                if (last.classList.contains('item-empty')) {
                    last.remove();
                }
            }
        });

        document.querySelectorAll('.folder-left').forEach(function(left) {
            var content = left.parentElement.parentElement.firstElementChild.nextElementSibling;
            var child = content.firstElementChild;
            var count = 0;
            while (child) {
                if (child.classList.contains('item-empty')) break;

                if (!child.firstElementChild.classList.contains('item-checked')) {
                    count++;
                }
                child = child.nextElementSibling;
            }
            left.innerHTML = ' ' +
            (count == 0 ? 'No' : count) +
            (count > 1 ? ' items' : ' item') +
            ' left';
        });

        document.querySelectorAll('.folder-delete').forEach(function(del) {
            var folder = del.parentElement.parentElement;
            if (!del.ontouchend) {
                del.ontouchend = del.onclick = function() {
                    deleteFolder(folder);
                };
            }
        });

        document.querySelectorAll('.folder-item.item-add').forEach(function(add) {
            var folderContent = add.parentElement.nextElementSibling;
            if (!add.ontouchend) {
                add.ontouchend = add.onclick = function() {
                    addItemToFolder(folderContent);
                };
            }
        });

        document.querySelectorAll('.folder-item.item-collapse').forEach(function(collapse) {
            var folderContent = collapse.parentElement.nextElementSibling;
            if (!collapse.ontouchend) {
                collapse.ontouchend = collapse.onclick = function() {
                    collapseFolder(folderContent);
                };
            }
            if (!folderContent.firstElementChild || folderContent.firstElementChild.classList.contains('item-front') || folderContent.firstElementChild.classList.contains('item-empty')) {
                collapse.classList.add('item-hidden');
                collapse.ontouchend = collapse.onclick = null;
            } else {
                collapse.classList.remove('item-hidden');
            }
        });

        document.querySelectorAll('.folder-item.item-front').forEach(function(front) {
            if (!front.ontouchend) {
                front.ontouchend = front.onclick = function(e) {
                    e.cancelBubble = true;  
                    expandFolder(front.parentElement);
                };
            }
        });

        document.querySelectorAll('.item-check').forEach(function(check) {
            if (!check.ontouchend) {
                check.ontouchend = check.onclick = function(e) {
                    e.cancelBubble = true;  
                    if (check.classList.contains('item-checked')) {
                        uncheckItem(check);
                    } else {
                        checkItem(check);
                    }
                };
            }
        });

        document.querySelectorAll('.item-delete').forEach(function(del) {
            if (!del.ontouchend) {
                del.ontouchend = del.onclick = function(e) {
                    e.cancelBubble = true;  
                    deleteFolderItem(del.parentElement);
                };
            }
        });

        document.querySelectorAll('.item-clear').forEach(function(clear) {
            var folderContent = clear.parentElement.nextElementSibling;
            if (!clear.ontouchend) {
                clear.ontouchend = clear.onclick = function(e) {
                    e.cancelBubble = true;  
                    clearFolder(clear.parentElement.nextElementSibling);
                };
            }
            if (!folderContent.firstElementChild ||
                folderContent.firstElementChild.classList.contains('item-empty')) {
                clear.classList.add('item-hidden');
                clear.ontouchend = clear.onclick = null;
            } else {
                clear.classList.remove('item-hidden');
            }
        });

        document.querySelectorAll('.folder-info input, .item-content input').forEach(
            function(input) {
                if (!input.ontouchend) {
                    input.ontouchend = input.onclick = function(e) {
                        e.cancelBubble = true;  
                    };
                }
                if (!input.onblur) {
                    input.onblur = function() {
                        if (!input.value) {
                            input.value = input.placeholder;
                        }
                        document.querySelectorAll('#search-label .selected').forEach(
                            function(label) {
                                if (label.id != 'label-all') {
                                    label.click();
                                }
                            }
                        );
                        updateLocalStorage();
                    };
                }
            }
        );

        updateLocalStorage();
    };

})();