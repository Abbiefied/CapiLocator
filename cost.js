//populate dropdown and link to cost of living page
$(document).ready(function () {

    var $countries = $('#countries-list')
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
                $countries.append('<li><a href="costofliving.html?country=' + encodeURIComponent(country.name.common) + '">' + country.name.common + '</a></li>');
            });        
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
});

// Cost of living API Call
function getCostOfLivingData(countryName) {
    var rapidAPIKey = 'a9da558f1bmsh651484094e56ea2p1a39b2jsncca2a24062fd';
    var rapidAPIHost = 'cost-of-living-and-prices.p.rapidapi.com';

    if (!countryName) {
        var countryName = decodeURIComponent(window.location.search.replace('?country=', ''))
    }
    console.log(countryName);
    var url = "https://cost-of-living-and-prices.p.rapidapi.com/prices?country_name=" + encodeURIComponent(countryName);
    $.ajax({
        url: url,
        headers: {
            'X-RapidAPI-Key': rapidAPIKey,
            'X-RapidAPI-Host': rapidAPIHost
        },
        data: {
            country: countryName,
        },
        success: function (data) {
            console.log(data);
            var selectedCountryData = data

            var countryInfoUrl = "https://restcountries.com/v2/name/" + encodeURIComponent(countryName) + "?fullText=true";
            $.ajax({
                url: countryInfoUrl,
                success: function (countryInfo) {
                    console.log(countryInfo);

                    selectedCountryData.population = countryInfo[0].population;
                    selectedCountryData.capital = countryInfo[0].capital;
                    selectedCountryData.subregion = countryInfo[0].subregion;
                    selectedCountryData.timezones = countryInfo[0].timezones;
                    selectedCountryData.lat = countryInfo[0].latlng[0];
                    selectedCountryData.long = countryInfo[0].latlng[1];
                    selectedCountryData.currSymbol = " (" + countryInfo[0].currencies[0].symbol + ")";
                    selectedCountryData.currencies = countryInfo[0].currencies[0].name + selectedCountryData.currSymbol;
                    selectedCountryData.languages = countryInfo[0].languages[0].name;
                    selectedCountryData.flag = countryInfo[0].flag;

                    var countryAbout = document.getElementById('country-about');
                    countryAbout.innerHTML = countryName + " has a population of " + selectedCountryData.population + " and it is located at latitude " +
                    selectedCountryData.lat + " and longitude " + selectedCountryData.long + " in the " + selectedCountryData.subregion + " subregion with the " + 
                    selectedCountryData.timezones + " timezone. The language is " + selectedCountryData.languages + " and the currency is " + selectedCountryData.currencies +
                    ". More information about the country and the cost of living in its capital city, " + selectedCountryData.capital + ", are presented below.";

                    //Display selected country data     
                    var $countryName = $('#country-name');
                    var $capital = $('#capital');
                    var $pricesList = $('#prices-list');
                    var $flag = $('#flag');
                    $countryName.text(selectedCountryData.country_name);
                    $capital.text(selectedCountryData.capital);
                    $flag.attr('src', selectedCountryData.flag);
                    $pricesList.empty();
                    var categories = {};
                    $.each(selectedCountryData.prices, function (i, price) {
                        if (!categories[price.category_name]) {
                            categories[price.category_name] = [];
                        }
                        categories[price.category_name].push(`<tr> <td  class="align-middle" style="background-color:#124747; 
                        width:300px">${price.item_name}</td><td class="align-middle" style="background-color:#388989">${price.min}</td>
                        <td class="align-middle" style="background-color:#388989">${price.avg}</td><td class="align-middle" style="background-color:#388989">${price.max}</td></tr>`);
                    });
                    for (let category in categories) {
                        $pricesList.append(`<h6 style="color:#124747">${category}</h6>`);
                        $pricesList.append(`<div class="table-responsive mx-auto">
                        <table class="table"><tr> 
                        <th class="align-middle">Item Name</th> <th class="align-middle">Minimum Price ${selectedCountryData.currSymbol}</th> 
                        <th class="align-middle">Average Price ${selectedCountryData.currSymbol}</th> <th class="align-middle">Maximum Price ${selectedCountryData.currSymbol} 
                        </th> </tr>` + categories[category].join('') + '</table></div>');
                    }
                    console.log('Initializing map with country name: ', countryName);
                    getCountryDetails();
                    createPieChart(selectedCountryData.prices);
                    initMap2();
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                },
            });
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        },
    });
}

// Google Map API call
function initMap2() {

    var countryName = decodeURIComponent(window.location.search.replace('?country=', ''))
    console.log(countryName)
    var capitalCity = "";

    //Geocode the selected country's capital city using Google Maps API
    var geocoder = new google.maps.Geocoder();

    $.ajax({
        url: "https://restcountries.com/v2/name/" + encodeURIComponent(countryName) + "?fullText=true",
        success: function (result) {
            if (result.length > 0) {
                capitalCity = result[0].capital;
                console.log(capitalCity);
                geocoder.geocode({ 'address': capitalCity }, function (results, status) {
                    console.log(results, status);
                    if (status == 'OK') {
                        //Define the map options
                        var mapOptions = {
                            zoom: 6,
                            center: results[0].geometry.location,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        };

                        //Create a new map object
                        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

                        var marker = new google.maps.Marker({
                            position: results[0].geometry.location,
                            map: map,
                            animation: google.maps.Animation.DROP,
                            title: capitalCity
                        });
                        var infoWindow = new google.maps.InfoWindow({
                            content: "<strong>" + countryName + "</strong><br>" +
                                "Capital: " + capitalCity + "<br>" +
                                "Population: " + result[0].population.toLocaleString()
                        });

                        marker.addListener("click", function () {
                            infoWindow.open(map, marker);
                        });
                    }
                    else {
                        console.log("Geocode was not successful. Error message: " + status);
                    }
                });
            }
            else {
                console.log("Could not find country data for " + countryName);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

// Get more country details from API Ninjas
function getCountryDetails() {
    var rapidAPIKey = '1ca8a0fb66msh23fd26fd3e1d4f5p19d955jsndb437160b2d1';
    var rapidAPIHost = 'country-by-api-ninjas.p.rapidapi.com';

        var countryName = decodeURIComponent(window.location.search.replace('?country=', ''))
    console.log(countryName);
    var url = "https://country-by-api-ninjas.p.rapidapi.com/v1/country?name=" + encodeURIComponent(countryName);
    $.ajax({
        url: url,
        headers: {
            'X-RapidAPI-Key': rapidAPIKey,
            'X-RapidAPI-Host': rapidAPIHost
        },
        data: {
            country: countryName,
        },
        success: function (countryData) {
            console.log(countryData);
            
            var $gdpGrowth = $('#gdp-growth');
            var $lifeExpectancyM = $('#life-exp-m');
            var $lifeExpectancyF = $('#life-exp-f');
            var $unemployment = $('#unemployment');
            var $homicide = $('#homicide');
            var $urbanGrowth = $('#urbanGrowth');
            var $infantMortality = $('#infantMortality');
            var $secondarySchoolFemale = $('#secondarySchoolFemale');
            var $secondarySchoolMale = $('#secondarySchoolMale');
            var $co2Emissions = $('#co2Emissions');
            var $internetUsers = $('#internetUsers');
            var $gdpPerCapita = $('#gdpPerCapita');
            var $fertility = $('#fertility');

            $gdpGrowth.text(countryData[0].gdp_growth);
            $lifeExpectancyM.text(countryData[0].life_expectancy_male);
            $lifeExpectancyF.text(countryData[0].life_expectancy_female);
            $unemployment.text(countryData[0].unemployment);
            $homicide.text(countryData[0].homicide_rate);
            $urbanGrowth.text(countryData[0].urban_population_growth);
            $infantMortality.text(countryData[0].infant_mortality);
            $secondarySchoolFemale.text(countryData[0].secondary_school_enrollment_female);
            $secondarySchoolMale.text(countryData[0].secondary_school_enrollment_male);
            $co2Emissions.text(countryData[0].co2_emissions);
            $internetUsers.text(countryData[0].internet_users);
            $gdpPerCapita.text(countryData[0].gdp_per_capita);
            $fertility.text(countryData[0].fertility);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log(textStatus, errorThrown);
        }
    });
}

//Create Pie chart
function createPieChart(prices) {
    var categories = {};
    prices.forEach(function(price) {
        if (!categories[price.category_name]) {
            categories[price.category_name] = 0;
        }
        categories[price.category_name] += price.avg;
    });

    var pieData = {
        labels: Object.keys(categories),
        datasets: [{
            data: Object.values(categories),
            backgroundColor: [

                '#ffdf2b',
                '#f7e583',
                '#c0aa2c',
                '#146060',
                '#2b6969',
                '#388989',
                '#124747',
                '#0d3535',
                '#3ba9a9',
                '#9a9787'
                
                
  
            ],
            hoverBackgroundColor: [
                '#0d3535',
                '#124747',
                '#3ba9a9',
                '#388989',
                '#c0aa2c',
                '#146060',
                '#ffdf2b',
                '#9a9787',
                '#f7e583',
                '#2b6969'
                
            ]
                
        }]
    };
    var pieOptions = {
        responsive: true,
    };
    var ctx = document.getElementById('pie-chart').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: pieData,
        options: pieOptions
    });
}

//compare countries
function compareCountries() {
    var rapidAPIKey = '1ca8a0fb66msh23fd26fd3e1d4f5p19d955jsndb437160b2d1';
    var rapidAPIHost = 'country-by-api-ninjas.p.rapidapi.com';
    var country1Name = $('#country1').val();
    var country2Name = $('#country2').val();

    if (!country1Name || !country2Name) {
        alert('Please enter two countries to compare');
        return;
    }

    var url1 = "https://country-by-api-ninjas.p.rapidapi.com/v1/country?name=" + encodeURIComponent(country1Name);
    var url2 = "https://country-by-api-ninjas.p.rapidapi.com/v1/country?name=" + encodeURIComponent(country2Name);

    Promise.all([
        $.ajax({
            url: url1,
            headers: {
                'X-RapidAPI-Key': rapidAPIKey,
                'X-RapidAPI-Host': rapidAPIHost
            }
        }),
        $.ajax({
            url: url2,
            headers: {
                'X-RapidAPI-Key': rapidAPIKey,
                'X-RapidAPI-Host': rapidAPIHost
            }
        })
    ]).then(function(results) {
        console.log(results);
        var country1Data = results[0][0];
        var country2Data = results[1][0];

        var table = $('<table>').addClass('table');
        var tbody =$('<tbody>');
        var thead = $('<thead>');
        var headRow = $('<tr>');
        headRow.append($('<th>').text('Details'));
        headRow.append($('<th>').text(country1Data.name));
        headRow.append($('<th>').text(country2Data.name));
        thead.append(headRow);

        var keys = ['gdp_growth', 'life_expectancy_male', 'life_expectancy_female', 'unemployment', 'homicide_rate', 'urban_population_growth', 'infant_mortality', 'secondary_school_enrollment_female', 'secondary_school_enrollment_male', 'co2_emissions', 'internet_users', 'gdp_per_capita', 'fertility'];
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var tr = $('<tr>');
            var td = $('<td style="background-color:#124747; width:520px;">').text(key);
            var td1 = $('<td style="background-color:#388989;">').text(country1Data[key] || 'N/A');
            var td2 = $('<td style="background-color:#388989">').text(country2Data[key] || 'N/A');
            tr.append(td);
            tr.append(td1);
            tr.append(td2);
            tbody.append(tr);
        }
        table.append(thead);
        table.append(tbody);
        $('#comparison-container').empty().append(table);
        createBarChart(country1Data, country2Data);
    }).catch(function(error) {
        console.error(error);
    });

}


// Create Bar chart
function createBarChart(country1Data, country2Data) {
    
    //Chart data for GDP Crowth and GDP per Capita
    var chartDataGDP = {
        labels: ['GDP Growth', 'GDP per Capita'],
        datasets: [{
            label: country1Data.name,
            backgroundColor: 'rgb(18, 71, 71)',
            borderColor: 'rgba(255, 223, 43, 0.2)',
            borderWidth: 1,
            data: [country1Data.gdp_growth, country1Data.gdp_per_capita]
        }, {
            label: country2Data.name,
            backgroundColor: 'rgb(19, 114, 114)',
            borderColor: 'rgba(255, 223, 43, 0.5)',
            borderWidth: 1,
            data: [country2Data.gdp_growth, country2Data.gdp_per_capita]
        }]
    };

    //Chart data for all other keys with lower values in percentage
    var chartDataOther = {
        labels: ['CO2 Emissions', 'Urban Population Growth', 'Unemployment', 'Homicide Rate', 'Secondary School Enrollment (Male)', 'Internet Users', 'Fertility', 'Secondary School Enrollment (Female)', 'Life Expectancy (Male)', 'Infant Mortality', 'Life Expectancy (Female)'],
        datasets: [{
            label: country1Data.name,
            backgroundColor: 'rgb(18, 71, 71)',
            borderColor: 'rgba(255, 223, 43, 0.2)',
            borderWidth: 1,
            data: [country1Data.co2_emissions, country1Data.urban_population_growth, country1Data.unemployment, country1Data.homicide_rate, country1Data.secondary_school_enrollment_male, country1Data.internet_users, country1Data.fertility, country1Data.secondary_school_enrollment_female, country1Data.life_expectancy_male, country1Data.infant_mortality, country1Data.life_expectancy_female]
        }, {
            label: country2Data.name,
            backgroundColor: 'rgb(19, 114, 114)',
            borderColor: 'rgba(255, 223, 43, 0.2)',
            borderWidth: 1,
            data: [country2Data.co2_emissions, country2Data.urban_population_growth, country2Data.unemployment, country2Data.homicide_rate, country2Data.secondary_school_enrollment_male, country2Data.internet_users, country2Data.fertility, country2Data.secondary_school_enrollment_female, country2Data.life_expectancy_male, country2Data.infant_mortality, country2Data.life_expectancy_female]
        }]
    };

    //Chart options
    var chart1Options = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        },
        title: {
            display: true,
            text:'GDP Comparison Chart'
        }
    };
    var chart2Options = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        },
        title: {
            display: true,
            text:'Quality of Life Indicators Comparison Chart'
        }
    };
    //Get canvas element for the charts
    var ctxGDP = document.getElementById('bar-chart-gdp').getContext('2d');
    var ctxOther = document.getElementById('bar-chart-other').getContext('2d');
    //Create charts
   new Chart(ctxGDP, {
        type: 'bar',
        data: chartDataGDP,
        options: chart1Options
    });
   new Chart(ctxOther, {
        type: 'bar',
        data: chartDataOther,
        options: chart2Options
            
    });
}

//compare Cost of Living between two countries
$('#compare-btn').on('click', function () {
    var rapidAPIKey = 'a9da558f1bmsh651484094e56ea2p1a39b2jsncca2a24062fd';
    var rapidAPIHost = 'cost-of-living-and-prices.p.rapidapi.com';

    var country1 = $('#country1').val();
    var country2 = $('#country2').val();
    if (country1 === '' || country2 === '') {
        alert('Please enter two countries to compare');
        return;
    }
    var url1 = "https://cost-of-living-and-prices.p.rapidapi.com/prices?country_name=" + encodeURIComponent(country1);
    var url2 = "https://cost-of-living-and-prices.p.rapidapi.com/prices?country_name=" + encodeURIComponent(country2);
    var promises = [$.ajax({
        url: url1,
        headers: {
            'X-RapidAPI-Key': rapidAPIKey,
            'X-RapidAPI-Host': rapidAPIHost
        },
        data: {
            country: country1,
        }
    }),
    $.ajax({
        url: url2,
        headers: {
            'X-RapidAPI-Key': rapidAPIKey,
            'X-RapidAPI-Host': rapidAPIHost
        },
        data: {
            country: country2,
        }
    })
];
    Promise.all(promises).then(function (results) {
        var data1 = results[0];
        var data2 = results[1];
        var categories = {};
        //Group items by category
        data1.prices.forEach(function (item) {
            if (!categories[item.category_name]) {
                categories[item.category_name] = {
                    name: item.category_name,
                    items: []
                };
            }
            var itemData = {
                name: item.item_name,
                price1: item.avg
            };
            categories[item.category_name].items.push(itemData);
            //Check if the same item is present in data2
            var item2 = data2.prices.find(function (i) {
                return i.item_name === item.item_name && i.category_name === item.category_name;
            });
            if (item2) {
                itemData.price2 = item2.avg;
            } else {
                itemData.price2 = undefined;
            }
        });
        data2.prices.forEach(function (item) {
            if (!categories[item.category_name]) {
                categories[item.category_name] = {
                    name: item.category_name,
                    items: []
                };
            }
            //Check if the item is already present in categories for data1
            var item1 = categories[item.category_name].items.find(function (i) {
                return i.name === item.item_name;
            });
            if (!item1) {
                categories[item.category_name].items.push({
                    name: item.item_name,
                    price1: undefined,
                    price2: item.avg
                });
            }

        });
        var $container = $('<div class="table-responsive mx-auto">');
        //Create a table for each category
        $.each(categories, function (i, category) {
            var $table = $('<table class="table">');
            $table.append(`<thead><tr><th colspan ="3" class="text-center">${category.name}</th></tr><tr><th>Item Name</th>
            <th>${country1}</th><th>${country2}</th></tr></thead>`);
            var $tbody = $('<tbody>');
            $.each(category.items, function (i, item) {
                var price1 = item.price1 !== undefined ? item.price1 : 'N/A';
                var price2 = item.price2 !== undefined ? item.price2 : 'N/A';
                $tbody.append(`<tr><td class="align-middle" style="background-color:#124747;  width:520px;">${item.name}</td>
                <td class="align-middle" style="background-color:#388989">${price1}</td><td class="align-middle" 
                style="background-color:#388989">${price2}</td></tr>`);
            });
            $table.append($tbody);
            $container.append($table);
        });
        $('#comparison-table').empty().append($container);
        compareCountries()
    }).catch(function (error) {
        console.log(error);
        alert('Error occurred while comparing countries');
    });
});
