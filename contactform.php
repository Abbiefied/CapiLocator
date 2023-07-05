<?php

if (isset($_POST['submit']) && $_POST['email'] != '') {

    
    $firstname = $_POST['firstname'];
    $lastname = $_POST['lastname'];
    $email = $_POST['email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

    if(empty($firstname) || empty($lastname) || empty($email) || empty($subject) || empty($message)) {
        echo "Please fill all required fields.";
        exit;
    }

    // Validate email format
    if (filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)){
        echo "Invalid email format.";
        exit;
    }

    //connect to database
    $servername = "sql104.epizy.com";
    $username = "epiz_33984159";
    $password = "ZIjrE6T697DPSR";
    $dbname = "epiz_33984159_contactdata";

    $conn = mysqli_connect($servername, $username, $password, $dbname);
    if (!$conn) {
        die("connection failed: ". mysqli_connect_error());
    }

    $sql = "INSERT INTO contact (firstname, lastname, email, subject, message) VALUES ('$firstname', '$lastname', '$email', '$subject', '$message')";
    if(mysqli_query($conn, $sql)) {
    $mailTo = "g.adekunle@alustudent.com";
    $headers = "From: ".$email;
    $txt = "You have received an email from ".$firstname.".\n\n".$message;

    if(mail($mailTo, $subject, $txt, $headers)) {
        echo "Thank you for contacting us.";
    } else {
        echo "Error: Unable to send email.";
    }
} else {
    echo "Error: Unable to save data to database.";
}

mysqli_close($conn);
}
?>