function pageChange(campaignID, page) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            document.getElementById('test-cases-list').innerHTML = this.responseText;
        }
    };

    xhttp.open('POST', 'test_cases_list', true);
    xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhttp.send('campaign_id=' + campaignID + '&page=' + page);

    let pageButtons = document.getElementsByClassName('page-btn');
    for (let i = 0; i < pageButtons.length; ++i) {
        pageButtons[i].disabled = pageButtons[i].id == ('b' + page);
    }
}

function redirect(url) {
    location.href = url;
}

function deleteTestCase(id) {
    if (confirm('Bạn có chắc muốn xóa Test Case có ID là ' + id + ' không?')) {
        redirect('delete_test_case?id=' + id);
    }
}
