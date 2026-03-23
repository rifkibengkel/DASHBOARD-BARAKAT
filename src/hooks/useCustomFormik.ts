import { useEffect } from 'react';
import { FormikConfig, FormikProps, FormikValues, useFormik } from 'formik';

const useCustomFormik = <Values extends FormikValues = FormikValues>(
    config: FormikConfig<Values>
): FormikProps<Values> => {
    const formik = useFormik(config);

    useEffect(() => {
        if (formik.isValid || !formik.isSubmitting) {
            return;
        }

        const firstErrorFieldName = Object.keys(formik.errors)[0];
        let element: HTMLElement | null =
            document.getElementsByName(firstErrorFieldName)[0] || document.getElementById(firstErrorFieldName);

        if (!element && firstErrorFieldName) {
            const nestedErrors = formik.errors[firstErrorFieldName] as Record<string, unknown> | undefined;
            const nestedField = nestedErrors?.value ? Object.keys(nestedErrors.value)[0] : null;

            if (nestedField) {
                element =
                    document.getElementsByName(`${nestedField}_ifr`)[0] ||
                    document.getElementById(`${nestedField}_ifr`) ||
                    document.getElementsByName(nestedField)[0];
            }
        }

        if (element && formik.errors[firstErrorFieldName]) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }, [formik.isSubmitting, formik.isValid, formik.errors]);

    return formik;
};

export default useCustomFormik;
