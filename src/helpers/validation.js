import {
        extend
} from 'vee-validate';
import {
        required,
        digits,
        email,
        min,
        max,
        regex
} from "vee-validate/dist/rules";


extend("passwordMatch", (password, confirm_password) => {
       if (password == confirm_password) {
               return true;               
       }else{
               return false;
       }
});

extend("ibanCheck", (iban) => {
        let IBAN = require('iban');
     return   IBAN.isValid(iban);
});

function validateDNI(dni) {
       dni = dni.toUpperCase();
        const dni_letters = "TRWAGMYFPDXBNJZSQVHLCKE";
        if (dni.length == 9) {
                let letter = dni_letters.charAt(parseInt(dni, 10) % 23)
                return letter == dni.charAt(8);
        }

        return false;
};

function validateNIE(nie) {
        nie = nie.toUpperCase();
        let nie_prefix = nie.charAt(0);
        switch (nie_prefix) {
                case "X":
                        nie_prefix = 0;
                        break;
                case "Y":
                        nie_prefix = 1;
                        break;
                case "Z":
                        nie_prefix = 2;
                        break;
        }
        return validateDNI(nie_prefix + nie.substr(1));
}

function validateCIF(cif) {
        cif = cif.toUpperCase();
        const CIF_REGEX = /^([ABCDEFGHJKLMNPQRSUVW])(\d{7})([0-9A-J])$/;
        if (CIF_REGEX.test(cif)) {
                const match = cif.match(CIF_REGEX);
                const letter = match[1],
                        number = match[2],
                        control = match[3];

                let even_sum = 0;
                let odd_sum = 0;
                let n;

                for (let i = 0; i < number.length; i++) {
                        n = parseInt(number[i], 10);

                        // Odd positions (Even index equals to odd position. i=0 equals first position)
                        if (i % 2 === 0) {
                                // Odd positions are multiplied first.
                                n *= 2;

                                // If the multiplication is bigger than 10 we need to adjust
                                odd_sum += n < 10 ? n : n - 9;

                                // Even positions
                                // Just sum them
                        } else {
                                even_sum += n;
                        }
                }

                const control_digit = 10 - (even_sum + odd_sum).toString().substr(-1);
                const control_letter = "JABCDEFGHI".substr(control_digit, 1);

                // Control must be a digit
                if (letter.match(/[ABEH]/)) {
                        return control == control_digit;

                        // Control must be a letter
                } else if (letter.match(/[KPQS]/)) {
                        return control == control_letter;

                        // Can be either
                } else {
                        return control == control_digit || control == control_letter;
                }
        }
}

extend('DocValido', (documento, values) => {

        if (values[0] == 'DNI') {
                return validateDNI(documento)
        }

        if (values[0] == 'NIE') {
                return validateNIE(documento)
        }

        if (values[0] == 'CIF') {
                return validateCIF(documento)
        }
});

extend("digits", {
        ...digits,
        message: "{_field_} tiene que ser de {length} dígitos ({_value_})",
});

extend("required", {
        ...required,
        message: "{_field_} no puede estar vacío",
});

extend("max", {
        ...max,
        message: "{_field_} no debe ser superior a {length} carácteres",
});

extend("min", {
        ...min,
        message: "{_field_} no debe ser inferior a {length} carácteres",
});

extend("regex", {
        ...regex,
        message: "{_value_} no es válido1",
});

extend("email", {
        ...email,
        message: "El Email debe ser válido",
});