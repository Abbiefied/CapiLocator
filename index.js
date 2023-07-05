//populate dropdown and link to cost of living page
$(document).ready(function () {

    var $countries = $('#countries-list');
    var rapidAPIKey = '5617579cfamsh64380e25b65f33fp1df008jsna8a9190a765d';
    var rapidAPIHost = 'country-facts.p.rapidapi.com';

    $.ajax({
        url: "https://country-facts.p.rapidapi.com/all",
        headers: {
            'X-RapidAPI-Key': rapidAPIKey,
            'X-RapidAPI-Host': rapidAPIHost
        },
        success: function (countries) {
            $.each(countries, function (i, country) {
                $countries.append('<li><a href="./HTML/costofliving.html?country=' + 
                encodeURIComponent(country.name.common) + '">' + country.name.common 
                + '</a></li>');
            });
            initMap1();
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
});


// Google map API call for homepage
function initMap1() {
    var map = new google.maps.Map(document.getElementById("map1"), {
        zoom: 2,
        center: { lat: 0, lng: 0 }
    });
    var rapidAPIKey = '5617579cfamsh64380e25b65f33fp1df008jsna8a9190a765d';
    var rapidAPIHost = 'country-facts.p.rapidapi.com';

    $.ajax({
        url: "https://country-facts.p.rapidapi.com/all",
        headers: {
            'X-RapidAPI-Key': rapidAPIKey,
            'X-RapidAPI-Host': rapidAPIHost
        },
        _success: function (countries) {
            $.each(countries, function (i, country) {
                var geocoder = new google.maps.Geocoder();
                geocoder.geocode({ 'address': country.capital[0] }, function (results, status) {
                    console.log(results, status);
                    if (status == 'OK') {
                        var marker = new google.maps.Marker({
                            position: results[0].geometry.location,
                            map: map,
                            animation: google.maps.Animation.DROP
                        });
                        var infoWindow = new google.maps.InfoWindow({
                            content: '<strong>' + country.name.common + '</strong><br>Capital: ' + country.capital[0] +
                                '<br>Population: ' + country.population +
                                '<br><a href="./HTML/costofliving.html?country=' + encodeURIComponent(country.name.common) + '">Cost of Living</a>'
                        });

                        marker.addListener("click", function () {
                            infoWindow.open(map, marker);
                        });
                    }
                    else {
                        console.log("Geocode was not successful. Error message: " + status);
                    }
                });
            });
        },
        get success() {
            return this._success;
        },
        set success(value) {
            this._success = value;
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}
