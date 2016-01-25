/*
 * Eric Eckert CSE 154 AC
 * Baby Names
 * js for names.html, contains functions to request information from babynames.php
 * in order to display a name list and data regarding the selected name
 * 
 */

"use strict";

//Onload function
$(function () {
    //Event handler for search button
    $("#search").click(search);
    //request to get all names
    request("https://webster.cs.washington.edu/cse154/babynames.php?type=list", getNames);
});

//if request was successful, put all names in select list.
function getNames() {
    //split data
    var list = this.responseText.split("\n");
    //add each name to list
    $.each(list, function (index, value) {
        $("#allnames").append($("<option/>", {
            text: value
        }));
    });
    //enable select list
    $("#allnames").prop("disabled", false);
    //hide loading icon
    $("#loadingnames").hide();
}

//search all data when button is clicked
function search() {
    //get name, if nothing is chosen, don't do anything
    var name = $("#allnames").val();
    if (name === "") {
        return;
    }
    //show result area
    $("#resultsarea").show();
    //hide the error message that would show if there is no data
    $("#norankdata").hide();
    //show loading icons
    $(".loading").show();
    //empty out data divs from last search
    $("#meaning").empty();
    $("#graph").empty();
    $("#celebs").empty();
    $("#errors").empty();

    //get name and gender
    var gender;
    $("[name='gender']").each(function () {
        if (this.checked) {
            gender = this.value;
            return false;
        }
    });

    //request all the info
    request("https://webster.cs.washington.edu/cse154/babynames.php?type=meaning&name=" + name, getMeaning);
    request("https://webster.cs.washington.edu/cse154/babynames.php?type=rank&name=" + name + "&gender=" + gender, setGraph);
    request("https://webster.cs.washington.edu/cse154/babynames.php?type=celebs&name=" + name + "&gender=" + gender, getCelebs);
}

//displays the name meaning in the appropriate area
function getMeaning() {
    $("#loadingmeaning").hide();
    $("#meaning").html(this.responseText);
}

//displays name data in a bar graph with labels for years and bars representing
//popularity
function setGraph() {
    $("#loadinggraph").hide();
    //error message if no data
    if (this.responseXML === null) {
        $("#norankdata").show();
        return;
    }
    //write all year numbers in table head tags, add to table
    var rankData = this.responseXML.querySelectorAll("rank");
    var tr = $("<tr>");
    $("#graph").append(tr);
    $.each(rankData, function () {
        tr.append($("<th>").html(this.getAttribute("year")));
    });
    //draw all bars and write popularity
    var bartr = $("<tr>");
    $("#graph").append(bartr);
    $.each(rankData, function () {
        var td = $("<td>");
        var popularity = parseInt(this.innerHTML, 10);
        var height;
        //if popularity is zero, bar is zero
        if (popularity === 0) {
            height = 0;
        } else {
            //calculate pixel height based on popularity
            var height = parseInt((1000 - popularity) / 4, 10);
        }
        //create bar div
        var $bar = jQuery("<div/>", {
            height: height + "px"
        });
        $bar.addClass("bar");
        if (popularity <= 10) {
            $bar.addClass("top");
        }
        $bar.html(popularity);
        td.append($bar);
        bartr.append(td);
    });
}

//displays info of celebrities with same first name
function getCelebs() {
    $("#loadingcelebs").hide();
    //parse data and add them to list one by one
    $.each(JSON.parse(this.responseText).actors, function (index, value) {
        $("#celebs").append($("<li>").html(value.firstName + " " + value.lastName + " (" + value.filmCount + " films)"));
    });
}

//sends a single GET request given a url and function to execute onload.
function request(url, fn) {
    var ajax = new XMLHttpRequest();
    ajax.onload = fn;
    ajax.onerror = ajaxFailure;
    ajax.open("GET", url, true);
    ajax.send();
}

//prints error when ajax fails
function ajaxFailure() {
    $("#norankdata").show();
    $("#errors").html("Error making Ajax request:" +
            "\n\nServer status:\n" + this.status + " " + this.statusText +
            "\n\nServer response text:\n" + this.responseText);
}